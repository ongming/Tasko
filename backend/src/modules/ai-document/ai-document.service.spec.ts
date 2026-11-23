import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { DataSource, EntityManager, Repository } from 'typeorm';
import { Task, TaskPriority } from '../tasks/entities/task.entity.js';
import { Status, StatusCategory } from '../projects/entities/status.entity.js';
import { Sprint } from '../sprints/entities/sprint.entity.js';
import { AiDocumentService } from './ai-document.service.js';
import {
  AiAnalysis,
  AiAnalysisStatus,
  AiDocumentFileType,
  type AiSuggestedTaskItem,
} from './entities/ai-analysis.entity.js';
import type { ProjectMember } from '../projects/entities/project-member.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
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
  let dataSourceMock: { transaction: ReturnType<typeof vi.fn> };

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

    dataSourceMock = {
      transaction: vi.fn(),
    };

    service = new AiDocumentService(
      aiAnalysisRepo as Repository<AiAnalysis>,
      projectMemberRepo as Repository<ProjectMember>,
      workTypeRepo as Repository<WorkType>,
      projectsService as ProjectsService,
      documentParserService,
      aiServiceMock,
      dataSourceMock as unknown as DataSource,
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

  describe('confirmTasks (AIDOC-05)', () => {
    function setupTxManager(overrides: {
      analysis?: AiAnalysis | null;
      existingTasks?: Array<{ id: string; task_key: string; position: number }>;
      sprints?: Array<{ id: string; project_id: string }>;
      failOnTaskSave?: boolean;
    }) {
      const savedAnalysisHistory: AiAnalysis[] = [];
      const createdTaskEntities: Task[] = [];

      const manager = {
        findOne: vi.fn((entityClass: unknown) => {
          if (entityClass === AiAnalysis) {
            return Promise.resolve(overrides.analysis ?? null);
          }
          if (entityClass === Status) {
            return Promise.resolve({
              id: 'status-todo-1',
              project_id: 'proj-uuid-1',
              category: StatusCategory.TODO,
              is_default: true,
              position: 1000,
            });
          }
          if (entityClass === WorkType) {
            return Promise.resolve({
              id: 'wt-task',
              project_id: 'proj-uuid-1',
              is_default: true,
            });
          }
          return Promise.resolve(null);
        }),
        find: vi.fn((entityClass: unknown) => {
          if (entityClass === Task) {
            return Promise.resolve(overrides.existingTasks ?? []);
          }
          if (entityClass === Sprint) {
            return Promise.resolve(overrides.sprints ?? []);
          }
          return Promise.resolve([]);
        }),
        create: vi.fn((_entityClass: unknown, data: Record<string, unknown>) => ({
          ...data,
        })),
        save: vi.fn((entityClass: unknown, payload: unknown) => {
          if (entityClass === Task) {
            if (overrides.failOnTaskSave) {
              return Promise.reject(new Error('DB constraint failure mid-transaction'));
            }
            const arr = (payload as Task[]).map((t, idx) => ({
              ...t,
              id: `created-task-id-${idx + 1}`,
            }));
            createdTaskEntities.push(...arr);
            return Promise.resolve(arr);
          }
          if (entityClass === AiAnalysis) {
            savedAnalysisHistory.push({ ...(payload as AiAnalysis) });
            return Promise.resolve(payload);
          }
          return Promise.resolve(payload);
        }),
      } as unknown as EntityManager;

      dataSourceMock.transaction.mockImplementation(
        async (cb: (m: EntityManager) => Promise<unknown>) => cb(manager),
      );

      return { manager, savedAnalysisHistory, createdTaskEntities };
    }

    it('tạo thành công nhiều task với task_key liên tiếp (tính cả soft-deleted), position tăng dần và chuyển status -> APPLIED', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.COMPLETED;
      analysis.suggested_tasks = [
        {
          tempId: 'tmp-1',
          selected: true,
          title: 'Xây dựng API giỏ hàng',
          description: 'Tính tổng tiền',
          priority: 'HIGH',
          storyPoints: 5,
          estimatedHours: 12,
          assigneeId: 'user-dev-1',
          workTypeId: 'wt-task',
          sprintId: null,
          startDate: '2026-11-24',
          dueDate: '2026-11-28',
        },
        {
          tempId: 'tmp-2',
          selected: false, // bị bỏ chọn -> không tạo
          title: 'Task không được chọn',
          description: '',
          priority: 'LOW',
          storyPoints: 1,
          estimatedHours: 2,
          assigneeId: null,
          workTypeId: null,
          sprintId: null,
          startDate: null,
          dueDate: null,
        },
        {
          tempId: 'tmp-3',
          selected: true,
          title: 'Viết test thanh toán VNPay',
          description: 'Bao phủ các kịch bản IPN',
          priority: 'URGENT',
          storyPoints: 3,
          estimatedHours: 8,
          assigneeId: null,
          workTypeId: null,
          sprintId: null,
          startDate: '2026-11-25',
          dueDate: '2026-11-29',
        },
      ];

      const { savedAnalysisHistory } = setupTxManager({
        analysis,
        existingTasks: [
          { id: 'old-1', task_key: 'SHOPX-10', position: 4000 }, // giả sử đã soft-delete
          { id: 'old-2', task_key: 'SHOPX-3', position: 2000 },
        ],
        sprints: [{ id: 'sprint-active-1', project_id: 'proj-uuid-1' }],
      });

      const result = await service.confirmTasks('SHOPX', 'analysis-1', 'user-pm-1', {
        defaultSprintId: 'sprint-active-1',
      });

      expect(result.analysisId).toBe('analysis-1');
      expect(result.status).toBe(AiAnalysisStatus.APPLIED);
      expect(result.createdCount).toBe(2);
      expect(result.tasks.map((t) => t.taskKey)).toEqual(['SHOPX-11', 'SHOPX-12']);
      expect(result.tasks.map((t) => t.position)).toEqual([5000, 6000]);
      expect(result.tasks[0].sprintId).toBe('sprint-active-1');
      expect(result.tasks[0].reporterId).toBe('user-pm-1');
      expect(result.tasks[1].typeId).toBe('wt-task'); // fallback default workType
      expect(savedAnalysisHistory[0].status).toBe(AiAnalysisStatus.APPLIED);
      expect(savedAnalysisHistory[0].applied_task_count).toBe(2);
    });

    it('chặn 409 ConflictException khi gọi lại lần 2 (status === APPLIED)', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.APPLIED;
      setupTxManager({ analysis });

      await expect(
        service.confirmTasks('SHOPX', 'analysis-1', 'user-pm-1', {}),
      ).rejects.toThrow(ConflictException);
    });

    it('chặn 400 BadRequestException khi không có công việc nào được chọn', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.COMPLETED;
      analysis.suggested_tasks = [
        {
          tempId: 'tmp-1',
          selected: false,
          title: 'Bị bỏ tick',
          description: '',
          priority: 'LOW',
          storyPoints: null,
          estimatedHours: null,
          assigneeId: null,
          workTypeId: null,
          sprintId: null,
          startDate: null,
          dueDate: null,
        },
      ];
      setupTxManager({ analysis });

      await expect(
        service.confirmTasks('SHOPX', 'analysis-1', 'user-pm-1', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('rollback và KHÔNG chuyển AiAnalysis sang APPLIED nếu lưu Task thất bại giữa chừng', async () => {
      const analysis = createMockAnalysis();
      analysis.status = AiAnalysisStatus.COMPLETED;
      analysis.suggested_tasks = [
        {
          tempId: 'tmp-1',
          selected: true,
          title: 'Task gây lỗi DB',
          description: '',
          priority: 'HIGH',
          storyPoints: 3,
          estimatedHours: 6,
          assigneeId: null,
          workTypeId: null,
          sprintId: null,
          startDate: null,
          dueDate: null,
        },
      ];
      const { savedAnalysisHistory } = setupTxManager({
        analysis,
        failOnTaskSave: true,
      });

      await expect(
        service.confirmTasks('SHOPX', 'analysis-1', 'user-pm-1', {}),
      ).rejects.toThrow('DB constraint failure mid-transaction');

      expect(analysis.status).toBe(AiAnalysisStatus.COMPLETED);
      expect(savedAnalysisHistory).toHaveLength(0);
    });
  });
});
