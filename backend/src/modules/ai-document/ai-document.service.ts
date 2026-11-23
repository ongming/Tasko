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
import { Repository } from 'typeorm';
import {
  AiAnalysis,
  AiAnalysisStatus,
  AiDocumentFileType,
  type AiSuggestedTaskItem,
} from './entities/ai-analysis.entity.js';
import { DocumentParserService } from './document-parser.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ProjectMember } from '../projects/entities/project-member.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import {
  AI_SERVICE,
  type AiProjectMemberContext,
  type AiWorkTypeContext,
  type IAiService,
} from './interfaces/ai-service.interface.js';
import { sanitizeSuggestedTasks } from './gemini-ai.service.js';
import type { UpdateSuggestedTasksDto } from './dto/update-suggested-tasks.dto.js';

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
}
