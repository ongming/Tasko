import {
  Injectable,
  Inject,
  NotFoundException,
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AiAnalysis,
  AiAnalysisStatus,
  AiDocumentFileType,
  type AiSuggestedTaskItem,
} from './entities/ai-analysis.entity.js';
import { DocumentParserService } from './document-parser.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ProjectMember } from '../projects/entities/project-member.entity.js';
import { Status, StatusCategory } from '../projects/entities/status.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { Sprint } from '../sprints/entities/sprint.entity.js';
import { Task, TaskPriority } from '../tasks/entities/task.entity.js';
import {
  AI_SERVICE,
  type AiProjectMemberContext,
  type AiWorkTypeContext,
  type IAiService,
} from './interfaces/ai-service.interface.js';
import { sanitizeSuggestedTasks } from './gemini-ai.service.js';
import type { UpdateSuggestedTasksDto } from './dto/update-suggested-tasks.dto.js';
import type { ConfirmAiTasksDto } from './dto/confirm-ai-tasks.dto.js';

export interface UploadDocumentResponse {
  id: string;
  fileName: string;
  fileType: AiDocumentFileType;
  fileSize: number;
  status: AiAnalysisStatus;
  extractedTextPreview: string;
  createdAt: Date;
}

export interface AnalyzeDocumentResponse extends UploadDocumentResponse {
  suggestedTaskCount: number;
  appliedTaskCount: number;
  errorMessage: string | null;
  suggestedTasks: AiSuggestedTaskItem[];
}

export interface AnalysisCreatorResponse {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface AnalysisDetailResponse extends AnalyzeDocumentResponse {
  updatedAt: Date;
  createdBy: AnalysisCreatorResponse | null;
}

export interface CreatedAiTaskSummary {
  id: string;
  projectId: string;
  sprintId: string | null;
  taskKey: string;
  title: string;
  description: string | null;
  typeId: string | null;
  statusId: string;
  storyPoints: number | null;
  priority: TaskPriority;
  assigneeId: string | null;
  reporterId: string | null;
  position: number;
  estimatedHours: number | null;
  startDate: Date | null;
  dueDate: Date | null;
}

export interface ConfirmAiTasksResponse {
  analysisId: string;
  status: AiAnalysisStatus;
  createdCount: number;
  createdTaskIds: string[];
  tasks: CreatedAiTaskSummary[];
}

@Injectable()
export class AiDocumentService {
  private readonly logger = new Logger(AiDocumentService.name);

  constructor(
    @InjectRepository(AiAnalysis)
    private readonly aiAnalysisRepository: Repository<AiAnalysis>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(WorkType)
    private readonly workTypeRepository: Repository<WorkType>,
    private readonly projectsService: ProjectsService,
    private readonly documentParserService: DocumentParserService,
    @Inject(AI_SERVICE)
    private readonly aiService: IAiService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * AIDOC-01: Tải lên tài liệu, trích xuất văn bản và lưu bản ghi AiAnalysis (status: UPLOADED)
   */
  async uploadDocument(
    projectIdOrKey: string,
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<UploadDocumentResponse> {
    const project = await this.projectsService.findProjectEntity(projectIdOrKey);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const parsed = await this.documentParserService.parseDocument(file);

    const analysis = this.aiAnalysisRepository.create({
      project_id: project.id,
      user_id: userId,
      file_name: parsed.fileName,
      file_type: parsed.fileType,
      file_size: parsed.fileSize,
      extracted_text: parsed.extractedText,
      suggested_tasks: [],
      status: AiAnalysisStatus.UPLOADED,
      applied_task_count: 0,
      error_message: null,
    });

    const saved = await this.aiAnalysisRepository.save(analysis);

    return {
      id: saved.id,
      fileName: saved.file_name,
      fileType: saved.file_type,
      fileSize: saved.file_size,
      status: saved.status,
      extractedTextPreview: parsed.extractedTextPreview,
      createdAt: saved.created_at,
    };
  }

  /**
   * AIDOC-02: Phân tích tài liệu đã tải lên bằng AI (Gemini) và lưu danh sách công việc đề xuất
   */
  async analyzeDocument(
    projectIdOrKey: string,
    analysisId: string,
    hint?: string,
  ): Promise<AnalyzeDocumentResponse> {
    const project = await this.projectsService.findProjectEntity(projectIdOrKey);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const analysis = await this.aiAnalysisRepository.findOne({
      where: { id: analysisId, project_id: project.id },
    });
    if (!analysis) {
      throw new NotFoundException('Không tìm thấy phiên phân tích tài liệu trong dự án này!');
    }

    // 1. Chuyển trạng thái sang ANALYZING
    analysis.status = AiAnalysisStatus.ANALYZING;
    analysis.error_message = null;
    await this.aiAnalysisRepository.save(analysis);

    // 2. Lấy ngữ cảnh thành viên & loại công việc thật của Project
    const [projectMembers, projectWorkTypes] = await Promise.all([
      this.projectMemberRepository.find({
        where: { project_id: project.id },
        relations: { user: true },
      }),
      this.workTypeRepository.find({
        where: { project_id: project.id },
      }),
    ]);

    const memberContexts: AiProjectMemberContext[] = projectMembers
      .filter((pm) => Boolean(pm.user))
      .map((pm) => ({
        id: pm.user.id,
        fullName: pm.user.full_name,
        email: pm.user.email,
        role: pm.role,
      }));

    const workTypeContexts: AiWorkTypeContext[] = projectWorkTypes.map((wt) => ({
      id: wt.id,
      name: wt.name,
      isDefault: wt.is_default,
    }));

    // 3. Gọi IAiService và sanitize kết quả đầu ra
    try {
      const rawTasks = await this.aiService.extractTasksFromText({
        text: analysis.extracted_text,
        fileName: analysis.file_name,
        projectName: project.name,
        members: memberContexts,
        workTypes: workTypeContexts,
        currentDate: new Date().toISOString().slice(0, 10),
        hint,
      });

      const sanitizedTasks = sanitizeSuggestedTasks(
        rawTasks,
        memberContexts,
        workTypeContexts,
      );

      analysis.suggested_tasks = sanitizedTasks;
      analysis.status = AiAnalysisStatus.COMPLETED;
      analysis.error_message = null;
      const saved = await this.aiAnalysisRepository.save(analysis);

      return {
        id: saved.id,
        fileName: saved.file_name,
        fileType: saved.file_type,
        fileSize: saved.file_size,
        status: saved.status,
        suggestedTaskCount: sanitizedTasks.length,
        appliedTaskCount: saved.applied_task_count,
        errorMessage: saved.error_message,
        extractedTextPreview: this.documentParserService.buildPreview(saved.extracted_text),
        suggestedTasks: sanitizedTasks,
        createdAt: saved.created_at,
      };
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : 'Lỗi không xác định khi gọi dịch vụ AI.';
      this.logger.error(
        `Phân tích AI thất bại cho analysis=${analysis.id} (project=${project.key}): ${errMessage}`,
      );

      analysis.status = AiAnalysisStatus.FAILED;
      analysis.error_message = errMessage;
      await this.aiAnalysisRepository.save(analysis);

      throw new BadGatewayException(
        `Không thể phân tích tài liệu bằng AI: ${errMessage}`,
      );
    }
  }

  /**
   * AIDOC-03: Xem chi tiết bản phân tích và danh sách công việc đề xuất
   */
  async getAnalysisDetail(
    projectIdOrKey: string,
    analysisId: string,
  ): Promise<AnalysisDetailResponse> {
    const project = await this.projectsService.findProjectEntity(projectIdOrKey);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const analysis = await this.aiAnalysisRepository.findOne({
      where: { id: analysisId, project_id: project.id },
      relations: { user: true },
    });

    if (!analysis) {
      throw new NotFoundException('Không tìm thấy phiên phân tích tài liệu trong dự án này!');
    }

    const suggestedTasks = Array.isArray(analysis.suggested_tasks)
      ? analysis.suggested_tasks
      : [];

    return {
      id: analysis.id,
      fileName: analysis.file_name,
      fileType: analysis.file_type,
      fileSize: analysis.file_size,
      status: analysis.status,
      suggestedTaskCount: suggestedTasks.length,
      appliedTaskCount: analysis.applied_task_count,
      errorMessage: analysis.error_message,
      extractedTextPreview: this.documentParserService.buildPreview(analysis.extracted_text),
      suggestedTasks,
      createdBy: analysis.user
        ? {
            id: analysis.user.id,
            fullName: analysis.user.full_name,
            email: analysis.user.email,
            avatarUrl: analysis.user.avatar_url,
          }
        : null,
      createdAt: analysis.created_at,
      updatedAt: analysis.updated_at,
    };
  }

  /**
   * AIDOC-04: Chỉnh sửa & lưu bản nháp danh sách công việc đề xuất trước khi tạo Task thật
   */
  async updateSuggestions(
    projectIdOrKey: string,
    analysisId: string,
    dto: UpdateSuggestedTasksDto,
  ): Promise<AnalysisDetailResponse> {
    const project = await this.projectsService.findProjectEntity(projectIdOrKey);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const analysis = await this.aiAnalysisRepository.findOne({
      where: { id: analysisId, project_id: project.id },
      relations: { user: true },
    });

    if (!analysis) {
      throw new NotFoundException('Không tìm thấy phiên phân tích tài liệu trong dự án này!');
    }

    if (analysis.status === AiAnalysisStatus.APPLIED) {
      throw new ConflictException(
        'Bản phân tích này đã được áp dụng tạo công việc, không thể chỉnh sửa',
      );
    }

    const assigneeIds = Array.from(
      new Set(
        dto.suggestedTasks
          .map((item) => item.assigneeId)
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0),
      ),
    );

    if (assigneeIds.length > 0) {
      const members = await this.projectMemberRepository.find({
        where: { project_id: project.id },
      });
      const validMemberUserIds = new Set(members.map((m) => m.user_id));
      const invalidAssignee = assigneeIds.find((id) => !validMemberUserIds.has(id));
      if (invalidAssignee) {
        throw new BadRequestException(
          `Người phụ trách (${invalidAssignee}) không thuộc thành viên của dự án này.`,
        );
      }
    }

    const normalizedTasks: AiSuggestedTaskItem[] = dto.suggestedTasks.map((item) => ({
      tempId: item.tempId.trim(),
      selected: item.selected,
      title: item.title.trim(),
      description: item.description?.trim() ?? '',
      priority: item.priority,
      storyPoints: item.storyPoints ?? null,
      estimatedHours: item.estimatedHours ?? null,
      assigneeId: item.assigneeId ?? null,
      workTypeId: item.workTypeId ?? null,
      sprintId: item.sprintId ?? null,
      startDate: item.startDate ?? null,
      dueDate: item.dueDate ?? null,
    }));

    analysis.suggested_tasks = normalizedTasks;
    const saved = await this.aiAnalysisRepository.save(analysis);

    return {
      id: saved.id,
      fileName: saved.file_name,
      fileType: saved.file_type,
      fileSize: saved.file_size,
      status: saved.status,
      suggestedTaskCount: normalizedTasks.length,
      appliedTaskCount: saved.applied_task_count,
      errorMessage: saved.error_message,
      extractedTextPreview: this.documentParserService.buildPreview(saved.extracted_text),
      suggestedTasks: normalizedTasks,
      createdBy: saved.user
        ? {
            id: saved.user.id,
            fullName: saved.user.full_name,
            email: saved.user.email,
            avatarUrl: saved.user.avatar_url,
          }
        : null,
      createdAt: saved.created_at,
      updatedAt: saved.updated_at,
    };
  }

  /**
   * AIDOC-05: Xác nhận tạo hàng loạt Task thật từ danh sách đề xuất trong 1 Transaction nguyên tử
   */
  async confirmTasks(
    projectIdOrKey: string,
    analysisId: string,
    userId: string,
    dto: ConfirmAiTasksDto,
  ): Promise<ConfirmAiTasksResponse> {
    const project = await this.projectsService.findProjectEntity(projectIdOrKey);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    return this.dataSource.transaction(async (manager) => {
      // 1. Kiểm tra bản ghi AiAnalysis tồn tại & chưa APPLIED
      const analysis = await manager.findOne(AiAnalysis, {
        where: { id: analysisId, project_id: project.id },
      });
      if (!analysis) {
        throw new NotFoundException('Không tìm thấy phiên phân tích tài liệu trong dự án này!');
      }
      if (analysis.status === AiAnalysisStatus.APPLIED) {
        throw new ConflictException(
          'Bản phân tích này đã được áp dụng tạo công việc trước đó!',
        );
      }

      // 2. Lấy danh sách task được chọn (selected !== false)
      const sourceTasks: AiSuggestedTaskItem[] =
        dto.tasks !== undefined
          ? dto.tasks.map((item) => ({
              tempId: item.tempId.trim(),
              selected: item.selected,
              title: item.title.trim(),
              description: item.description?.trim() ?? '',
              priority: item.priority,
              storyPoints: item.storyPoints ?? null,
              estimatedHours: item.estimatedHours ?? null,
              assigneeId: item.assigneeId ?? null,
              workTypeId: item.workTypeId ?? null,
              sprintId: item.sprintId ?? null,
              startDate: item.startDate ?? null,
              dueDate: item.dueDate ?? null,
            }))
          : Array.isArray(analysis.suggested_tasks)
            ? analysis.suggested_tasks
            : [];

      const selectedTasks = sourceTasks.filter((t) => t.selected !== false && t.title.trim().length > 0);
      if (selectedTasks.length === 0) {
        throw new BadRequestException('Vui lòng chọn ít nhất một công việc để tạo');
      }

      // 3. Lấy Status mặc định (cột TODO đầu tiên theo position, fallback is_default / đầu tiên)
      const defaultStatus =
        (await manager.findOne(Status, {
          where: { project_id: project.id, category: StatusCategory.TODO },
          order: { position: 'ASC' },
        })) ||
        (await manager.findOne(Status, {
          where: { project_id: project.id, is_default: true },
        })) ||
        (await manager.findOne(Status, {
          where: { project_id: project.id },
          order: { position: 'ASC' },
        }));

      if (!defaultStatus) {
        throw new BadRequestException('Dự án chưa có trạng thái công việc!');
      }

      // 4. Lấy WorkType mặc định của Project
      const defaultWorkType =
        (await manager.findOne(WorkType, {
          where: { project_id: project.id, is_default: true },
        })) ||
        (await manager.findOne(WorkType, {
          where: { project_id: project.id },
          order: { created_at: 'ASC' },
        }));

      // 5. Kiểm tra defaultSprintId & các sprintId của từng task (nếu có) thuộc đúng Project
      const requestedSprintIds = Array.from(
        new Set(
          [
            dto.defaultSprintId,
            ...selectedTasks.map((t) => t.sprintId),
          ].filter((id): id is string => typeof id === 'string' && id.trim().length > 0),
        ),
      );

      if (requestedSprintIds.length > 0) {
        const projectSprints = await manager.find(Sprint, {
          where: { project_id: project.id },
        });
        const validSprintIds = new Set(projectSprints.map((s) => s.id));
        const invalidSprintId = requestedSprintIds.find((id) => !validSprintIds.has(id));
        if (invalidSprintId) {
          throw new BadRequestException(
            `Sprint (${invalidSprintId}) không tồn tại trong dự án này!`,
          );
        }
      }

      // 6. Tìm số thứ tự task_key lớn nhất (bao gồm cả soft-deleted) & position lớn nhất
      const existingTasks = await manager.find(Task, {
        where: { project_id: project.id },
        select: { id: true, task_key: true, position: true },
        withDeleted: true,
      });

      let maxSeq = 0;
      let maxPosition = 0;
      for (const existing of existingTasks) {
        if (typeof existing.task_key === 'string') {
          const match = existing.task_key.match(/-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!Number.isNaN(num) && num > maxSeq) {
              maxSeq = num;
            }
          }
        }
        if (typeof existing.position === 'number' && existing.position > maxPosition) {
          maxPosition = existing.position;
        }
      }

      // 7. Tạo & lưu hàng loạt Task entities trong Transaction
      const taskEntities = selectedTasks.map((item, idx) =>
        manager.create(Task, {
          project_id: project.id,
          sprint_id: item.sprintId ?? dto.defaultSprintId ?? null,
          task_key: `${project.key}-${maxSeq + idx + 1}`,
          title: item.title.trim().slice(0, 255),
          description: item.description?.trim() || null,
          type_id: item.workTypeId ?? defaultWorkType?.id ?? null,
          status_id: defaultStatus.id,
          story_points: item.storyPoints ?? null,
          priority: (item.priority as TaskPriority) ?? TaskPriority.MEDIUM,
          assignee_id: item.assigneeId ?? null,
          reporter_id: userId,
          position: maxPosition + (idx + 1) * 1000,
          parent_task_id: null,
          estimated_hours: item.estimatedHours ?? null,
          start_date: item.startDate ? new Date(item.startDate) : null,
          due_date: item.dueDate ? new Date(item.dueDate) : null,
        }),
      );

      const createdTasks = await manager.save(Task, taskEntities);

      // 8. Cập nhật trạng thái AiAnalysis -> APPLIED
      analysis.status = AiAnalysisStatus.APPLIED;
      analysis.applied_task_count = createdTasks.length;
      if (dto.tasks !== undefined) {
        analysis.suggested_tasks = sourceTasks.map((item) => ({
          ...item,
          sprintId: item.sprintId ?? dto.defaultSprintId ?? null,
        }));
      }
      await manager.save(AiAnalysis, analysis);

      const mappedTasks: CreatedAiTaskSummary[] = createdTasks.map((t) => ({
        id: t.id,
        projectId: t.project_id,
        sprintId: t.sprint_id,
        taskKey: t.task_key,
        title: t.title,
        description: t.description,
        typeId: t.type_id,
        statusId: t.status_id,
        storyPoints: t.story_points,
        priority: t.priority,
        assigneeId: t.assignee_id,
        reporterId: t.reporter_id,
        position: t.position,
        estimatedHours: t.estimated_hours,
        startDate: t.start_date,
        dueDate: t.due_date,
      }));

      return {
        analysisId: analysis.id,
        status: analysis.status,
        createdCount: createdTasks.length,
        createdTaskIds: createdTasks.map((t) => t.id),
        tasks: mappedTasks,
      };
    });
  }
}
