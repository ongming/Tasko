import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { Repository } from 'typeorm';
import { TaskPriority } from '../tasks/entities/task.entity.js';
import { AiDocumentService } from './ai-document.service.js';
import {
  AiAnalysis,
  AiAnalysisStatus,
  AiDocumentFileType,
  type AiSuggestedTaskItem,
} from './entities/ai-analysis.entity.js';
import type { ProjectMember } from '../projects/entities/project-member.entity.js';
import type { WorkType } from '../projects/entities/work-type.entity.js';
import type { ProjectsService } from '../projects/projects.service.js';
import { DocumentParserService } from './document-parser.service.js';
import type { IAiService } from './interfaces/ai-service.interface.js';
import { sanitizeSuggestedTasks } from './gemini-ai.service.js';

describe('AiDocumentService (AIDOC-02)', () => {
  let service: AiDocumentService;
  let aiAnalysisRepo: Partial<Repository<AiAnalysis>>;
  let projectMemberRepo: Partial<Repository<ProjectMember>>;
  let workTypeRepo: Partial<Repository<WorkType>>;
  let projectsService: Partial<ProjectsService>;
  let documentParserService: DocumentParserService;
  let aiServiceMock: IAiService;

  const mockProject = {
    id: 'proj-uuid-1',
    key: 'SHOPX',
    name: 'Nền tảng ShopX',
  };

  const mockMembers = [
    {
      id: 'pm-1',
      project_id: 'proj-uuid-1',
      user_id: 'user-dev-1',
      role: 'MEMBER',
      user: {
        id: 'user-dev-1',
        full_name: 'Phạm Quốc Bảo',
        email: 'dev1@tasko.vn',
      },
    },
  ] as unknown as ProjectMember[];

  const mockWorkTypes = [
    { id: 'wt-task', project_id: 'proj-uuid-1', name: 'Task', is_default: true },
    { id: 'wt-bug', project_id: 'proj-uuid-1', name: 'Bug', is_default: false },
  ] as unknown as WorkType[];

  const createMockAnalysis = (): AiAnalysis =>
    ({
      id: 'analysis-1',
      project_id: 'proj-uuid-1',
      user_id: 'user-pm-1',
      file_name: 'BRD_ShopX.pdf',
      file_type: AiDocumentFileType.PDF,
      file_size: 120_000,
      extracted_text: 'Tài liệu đặc tả chức năng thanh toán VNPay và quản lý tồn kho Flash Sale.',
      suggested_tasks: [],
      status: AiAnalysisStatus.UPLOADED,
      applied_task_count: 0,
      error_message: null,
      created_at: new Date('2026-11-24T00:00:00.000Z'),
      updated_at: new Date('2026-11-24T00:00:00.000Z'),
    }) as AiAnalysis;

  beforeEach(() => {
    vi.clearAllMocks();

    aiAnalysisRepo = {
      findOne: vi.fn(),
      save: vi.fn((entity: AiAnalysis) => Promise.resolve(entity)),
      create: vi.fn((data: Partial<AiAnalysis>) => data as AiAnalysis),
    };

    projectMemberRepo = {
      find: vi.fn().mockResolvedValue(mockMembers),
    };

    workTypeRepo = {
      find: vi.fn().mockResolvedValue(mockWorkTypes),
    };

    projectsService = {
      findProjectEntity: vi.fn().mockResolvedValue(mockProject),
    };

    documentParserService = new DocumentParserService();

    aiServiceMock = {
      extractTasksFromText: vi.fn(),
    };

    service = new AiDocumentService(
      aiAnalysisRepo as Repository<AiAnalysis>,
      projectMemberRepo as Repository<ProjectMember>,
      workTypeRepo as Repository<WorkType>,
      projectsService as ProjectsService,
      documentParserService,
      aiServiceMock,
    );
  });

  it('phân tích tài liệu thành công, chuyển ANALYZING -> COMPLETED và lưu suggested_tasks', async () => {
    const analysis = createMockAnalysis();
    const savedStatuses: AiAnalysisStatus[] = [];

    vi.mocked(aiAnalysisRepo.findOne!).mockResolvedValue(analysis);
    vi.mocked(aiAnalysisRepo.save!).mockImplementation((entity: AiAnalysis) => {
      savedStatuses.push(entity.status);
      return Promise.resolve(entity);
    });

    const mockAiOutput: AiSuggestedTaskItem[] = [
      {
        tempId: 'tmp-1',
        selected: true,
        title: 'Tích hợp webhook VNPay IPN',
        description: 'Xác thực chữ ký SHA512 và cập nhật trạng thái đơn hàng.',
        priority: 'URGENT',
        storyPoints: 5,
        estimatedHours: 14,
        assigneeId: 'user-dev-1',
        workTypeId: 'wt-task',
        sprintId: null,
        startDate: '2026-11-24',
        dueDate: '2026-11-28',
      },
    ];
    const extractMock = vi.fn().mockResolvedValue(mockAiOutput);
    aiServiceMock.extractTasksFromText = extractMock;

    const result = await service.analyzeDocument('SHOPX', 'analysis-1', 'Tập trung Backend');

    expect(savedStatuses).toEqual([AiAnalysisStatus.ANALYZING, AiAnalysisStatus.COMPLETED]);
    expect(extractMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'BRD_ShopX.pdf',
        projectName: 'Nền tảng ShopX',
        hint: 'Tập trung Backend',
      }),
    );
    expect(result.status).toBe(AiAnalysisStatus.COMPLETED);
    expect(result.suggestedTaskCount).toBe(1);
    expect(result.suggestedTasks[0].assigneeId).toBe('user-dev-1');
    expect(result.suggestedTasks[0].workTypeId).toBe('wt-task');
  });

  it('sanitize dữ liệu ảo giác từ AI: loại bỏ dòng rỗng, reset assigneeId/date sai, fallback priority & workType', () => {
    const members = [
      { id: 'user-dev-1', fullName: 'Phạm Quốc Bảo', email: 'dev1@tasko.vn' },
    ];
    const workTypes = [
      { id: 'wt-task', name: 'Task', isDefault: true },
      { id: 'wt-bug', name: 'Bug', isDefault: false },
    ];

    const dirtyAiOutput = [
      {
        title: '   ',
        description: 'Dòng này phải bị loại vì title rỗng',
        priority: 'HIGH',
      },
      {
        title: 'Sửa lỗi tồn kho âm',
        description: 'Dùng Redis Lua Script để khóa tồn kho.',
        priority: 'SUPER_CRITICAL', // sai enum -> fallback MEDIUM
        storyPoints: 999, // vượt giới hạn -> null
        estimatedHours: -5, // âm -> null
        assigneeId: 'hallucinated-user-999', // không thuộc project -> null
        workTypeId: 'hallucinated-wt-999', // không thuộc project -> fallback wt-task (default)
        startDate: '2026-02-30', // ngày không tồn tại -> null
        dueDate: '2026-12-01', // hợp lệ -> giữ nguyên
      },
      {
        title: 'Kiểm thử thanh toán',
        description: 'Chạy test E2E',
        priority: 'high', // viết thường -> chuẩn hóa HIGH
        assigneeId: 'user-dev-1', // hợp lệ -> giữ nguyên
        workTypeId: 'Bug', // map theo tên -> wt-bug
        startDate: '2026-11-25',
        dueDate: 'next friday', // sai định dạng -> null
      },
    ];

    const sanitized = sanitizeSuggestedTasks(dirtyAiOutput, members, workTypes);

    expect(sanitized).toHaveLength(2);

    expect(sanitized[0]).toMatchObject({
      selected: true,
      title: 'Sửa lỗi tồn kho âm',
      priority: 'MEDIUM',
      storyPoints: null,
      estimatedHours: null,
      assigneeId: null,
      workTypeId: 'wt-task',
      sprintId: null,
      startDate: null,
      dueDate: '2026-12-01',
    });
    expect(sanitized[0].tempId).toBeTruthy();

    expect(sanitized[1]).toMatchObject({
      selected: true,
      title: 'Kiểm thử thanh toán',
      priority: 'HIGH',
      assigneeId: 'user-dev-1',
      workTypeId: 'wt-bug',
      startDate: '2026-11-25',
      dueDate: null,
    });
  });

  it('lưu status FAILED, error_message và ném 502 BadGatewayException khi Gemini API lỗi', async () => {
    const analysis = createMockAnalysis();
    vi.mocked(aiAnalysisRepo.findOne!).mockResolvedValue(analysis);
    aiServiceMock.extractTasksFromText = vi
      .fn()
      .mockRejectedValue(new Error('Quota exceeded for Gemini API'));

    await expect(service.analyzeDocument('SHOPX', 'analysis-1')).rejects.toThrow(
      BadGatewayException,
    );

    expect(analysis.status).toBe(AiAnalysisStatus.FAILED);
    expect(analysis.error_message).toBe('Quota exceeded for Gemini API');
  });

  it('ném NotFoundException nếu AiAnalysis không thuộc dự án hiện tại', async () => {
    vi.mocked(aiAnalysisRepo.findOne!).mockResolvedValue(null);

    await expect(service.analyzeDocument('SHOPX', 'non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('getAnalysisDetail (AIDOC-03)', () => {
    it('trả về đầy đủ metadata, createdBy và suggestedTasks khi tìm thấy hợp lệ', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.COMPLETED;
      analysis.suggested_tasks = [
        {
          tempId: 'tmp-1',
          selected: true,
          title: 'Thiết kế API thanh toán',
          description: 'Chuẩn hóa DTO và xác thực chữ ký.',
          priority: 'HIGH',
          storyPoints: 5,
          estimatedHours: 12,
          assigneeId: 'user-dev-1',
          workTypeId: 'wt-task',
          sprintId: null,
          startDate: '2026-11-24',
          dueDate: '2026-11-28',
        },
      ];
      analysis.user = {
        id: 'user-pm-1',
        full_name: 'Nguyễn Đình Quang Minh',
        email: 'pm@tasko.vn',
        avatar_url: 'https://example.com/pm.png',
      } as AiAnalysis['user'];

      const findOneMock = vi.fn().mockResolvedValue(analysis);
      aiAnalysisRepo.findOne = findOneMock;

      const result = await service.getAnalysisDetail('SHOPX', 'analysis-1');

      expect(findOneMock).toHaveBeenCalledWith({
        where: { id: 'analysis-1', project_id: 'proj-uuid-1' },
        relations: { user: true },
      });
      expect(result.id).toBe('analysis-1');
      expect(result.fileName).toBe('BRD_ShopX.pdf');
      expect(result.status).toBe(AiAnalysisStatus.COMPLETED);
      expect(result.suggestedTaskCount).toBe(1);
      expect(result.suggestedTasks).toHaveLength(1);
      expect(result.suggestedTasks[0].title).toBe('Thiết kế API thanh toán');
      expect(result.createdBy).toEqual({
        id: 'user-pm-1',
        fullName: 'Nguyễn Đình Quang Minh',
        email: 'pm@tasko.vn',
        avatarUrl: 'https://example.com/pm.png',
      });
      expect(result.updatedAt).toEqual(analysis.updated_at);
    });

    it('ném NotFoundException (404) khi sai analysisId hoặc không thuộc projectId', async () => {
      aiAnalysisRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(service.getAnalysisDetail('SHOPX', 'wrong-analysis-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ném NotFoundException (404) khi projectId không tồn tại', async () => {
      projectsService.findProjectEntity = vi.fn().mockResolvedValue(null);

      await expect(service.getAnalysisDetail('UNKNOWN_KEY', 'analysis-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSuggestions (AIDOC-04)', () => {
    it('cập nhật danh sách suggested_tasks thành công khi assigneeId thuộc thành viên dự án', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.COMPLETED;
      aiAnalysisRepo.findOne = vi.fn().mockResolvedValue(analysis);

      const dto = {
        suggestedTasks: [
          {
            tempId: 'tmp-1',
            selected: true,
            title: '  Cập nhật tiêu đề công việc  ',
            description: 'Mô tả chi tiết mới',
            priority: TaskPriority.URGENT,
            storyPoints: 8,
            estimatedHours: 20,
            assigneeId: 'user-dev-1',
            workTypeId: 'wt-task',
            sprintId: null,
            startDate: '2026-11-24',
            dueDate: '2026-11-30',
          },
        ],
      };

      const result = await service.updateSuggestions('SHOPX', 'analysis-1', dto);

      expect(result.suggestedTaskCount).toBe(1);
      expect(result.suggestedTasks[0].title).toBe('Cập nhật tiêu đề công việc');
      expect(result.suggestedTasks[0].assigneeId).toBe('user-dev-1');
      expect(analysis.suggested_tasks).toHaveLength(1);
    });

    it('ném ConflictException (409) khi bản phân tích đã ở trạng thái APPLIED', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.APPLIED;
      aiAnalysisRepo.findOne = vi.fn().mockResolvedValue(analysis);

      await expect(
        service.updateSuggestions('SHOPX', 'analysis-1', { suggestedTasks: [] }),
      ).rejects.toThrow(ConflictException);
    });

    it('ném BadRequestException (400) khi assigneeId không thuộc thành viên dự án', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.COMPLETED;
      aiAnalysisRepo.findOne = vi.fn().mockResolvedValue(analysis);

      await expect(
        service.updateSuggestions('SHOPX', 'analysis-1', {
          suggestedTasks: [
            {
              tempId: 'tmp-1',
              selected: true,
              title: 'Task không hợp lệ assignee',
              priority: TaskPriority.MEDIUM,
              assigneeId: 'stranger-user-999',
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném NotFoundException (404) khi bản phân tích không tồn tại', async () => {
      aiAnalysisRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(
        service.updateSuggestions('SHOPX', 'missing-id', { suggestedTasks: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
