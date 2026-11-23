import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
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
});
