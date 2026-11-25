import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'node:path';
import { TaskAttachment } from './entities/task-attachment.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { ProjectMember, ProjectRole } from '../projects/entities/project-member.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import {
  CLOUDINARY_SERVICE,
  type CloudinaryResourceType,
  type ICloudinaryService,
} from '../cloudinary/interfaces/cloudinary-service.interface.js';

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
  '.csv',
  '.zip',
]);

export const BLOCKED_ATTACHMENT_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.js',
  '.mjs',
  '.cjs',
  '.msi',
  '.dll',
  '.ps1',
  '.vbs',
  '.scr',
  '.com',
]);

export interface TaskAttachmentUploaderResponse {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface TaskAttachmentResponse {
  id: string;
  taskId: string;
  userId: string | null;
  fileName: string;
  fileUrl: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  mimeType: string;
  fileSize: number;
  uploader: TaskAttachmentUploaderResponse | null;
  createdAt: Date;
}

export function normalizeMulterFileName(rawName: string): string {
  const trimmed = (rawName || 'untitled').trim();
  if (!trimmed) return 'untitled';

  const hasHighLatin1Only =
    /[\x80-\xFF]/.test(trimmed) && !/[^\x00-\xFF]/.test(trimmed);

  if (hasHighLatin1Only) {
    try {
      const decoded = Buffer.from(trimmed, 'latin1').toString('utf8');
      if (
        decoded &&
        !decoded.includes('\uFFFD') &&
        Buffer.from(decoded, 'utf8').toString('latin1') === trimmed
      ) {
        return decoded.slice(0, 255);
      }
    } catch {
      // Giữ nguyên tên gốc nếu không phải chuỗi UTF-8 bị đọc nhầm sang latin1
    }
  }

  return trimmed.slice(0, 255);
}

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @InjectRepository(TaskAttachment)
    private readonly attachmentRepository: Repository<TaskAttachment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinaryService: ICloudinaryService,
  ) {}

  private isUuid(val: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  }

  private async resolveProject(projectIdOrKey: string): Promise<Project> {
    let project: Project | null = null;
    if (this.isUuid(projectIdOrKey)) {
      project = await this.projectRepository.findOne({ where: { id: projectIdOrKey } });
    } else {
      project = await this.projectRepository.findOne({
        where: { key: projectIdOrKey.toUpperCase() },
      });
      if (!project) {
        project = await this.projectRepository.findOne({ where: { id: projectIdOrKey } });
      }
    }

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }
    return project;
  }

  private async resolveTaskInProject(
    projectIdOrKey: string,
    taskId: string,
  ): Promise<{ project: Project; task: Task }> {
    const project = await this.resolveProject(projectIdOrKey);
    const task = await this.taskRepository.findOne({
      where: { id: taskId, project_id: project.id },
    });

    if (!task) {
      throw new NotFoundException('Không tìm thấy công việc trong dự án này!');
    }

    return { project, task };
  }

  private normalizeResourceType(value: string): CloudinaryResourceType {
    if (value === 'image' || value === 'video') {
      return value;
    }
    return 'raw';
  }

  private formatAttachment(attachment: TaskAttachment): TaskAttachmentResponse {
    return {
      id: attachment.id,
      taskId: attachment.task_id,
      userId: attachment.user_id,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      publicId: attachment.public_id,
      resourceType: this.normalizeResourceType(attachment.resource_type),
      mimeType: attachment.mime_type,
      fileSize: attachment.file_size,
      uploader: attachment.user
        ? {
            id: attachment.user.id,
            fullName: attachment.user.full_name,
            avatarUrl: attachment.user.avatar_url ?? null,
          }
        : null,
      createdAt: attachment.created_at,
    };
  }

  private validateFile(file: Express.Multer.File | undefined): string {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng chọn tệp đính kèm để tải lên.');
    }

    if (file.size <= 0) {
      throw new BadRequestException('Tệp tải lên đang trống (0 bytes).');
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new BadRequestException(
        'Kích thước tệp đính kèm vượt quá giới hạn tối đa 10 MB.',
      );
    }

    const normalizedName = normalizeMulterFileName(file.originalname);
    const ext = extname(normalizedName).toLowerCase();

    if (!ext || BLOCKED_ATTACHMENT_EXTENSIONS.has(ext) || !ALLOWED_ATTACHMENT_EXTENSIONS.has(ext)) {
      throw new BadRequestException(
        'Định dạng tệp không được hỗ trợ hoặc không an toàn. Chỉ chấp nhận ảnh (JPG, PNG, WEBP, GIF), tài liệu (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, MD, CSV) và nén ZIP.',
      );
    }

    return normalizedName;
  }

  private async canModerateAttachments(project: Project, userId: string): Promise<boolean> {
    if (project.owner_id === userId) {
      return true;
    }

    const wsMember = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
      relations: {
        roleEntity: {
          rolePermissions: {
            permission: true,
          },
        },
      },
    });

    if (wsMember) {
      const isWsOwner = wsMember.role === WorkspaceRole.OWNER;
      const isWsAdminRole = wsMember.roleEntity?.name?.toUpperCase() === 'ADMIN';
      const hasWsAdminPerm = wsMember.roleEntity?.rolePermissions?.some(
        (rp) => rp.permission?.code === 'WORKSPACE_ADMIN',
      );
      if (isWsOwner || isWsAdminRole || hasWsAdminPerm) {
        return true;
      }
    }

    const projMember = await this.projectMemberRepository.findOne({
      where: { project_id: project.id, user_id: userId },
      relations: { roleEntity: true },
    });

    if (projMember) {
      const isProjOwner =
        projMember.role === ProjectRole.OWNER ||
        projMember.roleEntity?.name?.toUpperCase() === 'OWNER';
      if (isProjOwner) {
        return true;
      }
    }

    return false;
  }

  async findByTask(
    projectIdOrKey: string,
    taskId: string,
  ): Promise<TaskAttachmentResponse[]> {
    const { task } = await this.resolveTaskInProject(projectIdOrKey, taskId);

    const attachments = await this.attachmentRepository.find({
      where: { task_id: task.id },
      relations: { user: true },
      order: { created_at: 'DESC' },
    });

    return attachments.map((item) => this.formatAttachment(item));
  }

  async upload(
    projectIdOrKey: string,
    taskId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<TaskAttachmentResponse> {
    const normalizedFileName = this.validateFile(file);
    const { task } = await this.resolveTaskInProject(projectIdOrKey, taskId);

    const uploaded = await this.cloudinaryService.uploadFile(
      file,
      'tasko/attachments',
    );

    try {
      const entity = this.attachmentRepository.create({
        task_id: task.id,
        user_id: userId,
        file_name: normalizedFileName,
        file_url: uploaded.url,
        public_id: uploaded.publicId,
        resource_type: uploaded.resourceType,
        mime_type: (file.mimetype || 'application/octet-stream').slice(0, 120),
        file_size: file.size,
      });

      const saved = await this.attachmentRepository.save(entity);
      const withUploader = await this.attachmentRepository.findOne({
        where: { id: saved.id },
        relations: { user: true },
      });

      return this.formatAttachment(withUploader ?? saved);
    } catch (dbError) {
      try {
        await this.cloudinaryService.deleteFile(
          uploaded.publicId,
          uploaded.resourceType,
        );
      } catch (cleanupError) {
        this.logger.warn(
          `Cleanup Cloudinary file failed (publicId=${uploaded.publicId}): ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`,
        );
      }
      throw dbError;
    }
  }

  async remove(
    projectIdOrKey: string,
    taskId: string,
    attachmentId: string,
    userId: string,
  ): Promise<{ deleted: true; id: string }> {
    const { project, task } = await this.resolveTaskInProject(projectIdOrKey, taskId);

    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, task_id: task.id },
    });

    if (!attachment) {
      throw new NotFoundException('Không tìm thấy tệp đính kèm trong công việc này!');
    }

    if (attachment.user_id !== userId) {
      const canModerate = await this.canModerateAttachments(project, userId);
      if (!canModerate) {
        throw new ForbiddenException('Bạn không có quyền xóa tệp đính kèm này');
      }
    }

    const publicId = attachment.public_id;
    const resourceType = this.normalizeResourceType(attachment.resource_type);

    await this.attachmentRepository.remove(attachment);

    if (publicId) {
      await this.cloudinaryService.deleteFile(publicId, resourceType);
    }

    return { deleted: true, id: attachmentId };
  }
}
