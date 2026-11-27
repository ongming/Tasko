import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskComment } from './entities/task-comment.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { ProjectMember, ProjectRole } from '../projects/entities/project-member.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from './dto/task-comment.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../notifications/entities/notification.entity.js';

export interface TaskCommentAuthorResponse {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface TaskCommentResponse {
  id: string;
  taskId: string;
  userId: string | null;
  content: string;
  isEdited: boolean;
  author: TaskCommentAuthorResponse | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly commentRepository: Repository<TaskComment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @Optional()
    private readonly notificationsService?: NotificationsService,
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

  private formatComment(comment: TaskComment): TaskCommentResponse {
    return {
      id: comment.id,
      taskId: comment.task_id,
      userId: comment.user_id,
      content: comment.content,
      isEdited: Boolean(comment.is_edited),
      author: comment.user
        ? {
            id: comment.user.id,
            fullName: comment.user.full_name,
            email: comment.user.email,
            avatarUrl: comment.user.avatar_url ?? null,
          }
        : null,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    };
  }

  private async canModerateComments(project: Project, userId: string): Promise<boolean> {
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

  async findByTask(projectIdOrKey: string, taskId: string): Promise<TaskCommentResponse[]> {
    const { task } = await this.resolveTaskInProject(projectIdOrKey, taskId);

    const comments = await this.commentRepository.find({
      where: { task_id: task.id },
      relations: { user: true },
      order: { created_at: 'ASC' },
    });

    return comments.map((c) => this.formatComment(c));
  }

  async create(
    projectIdOrKey: string,
    taskId: string,
    userId: string,
    dto: CreateTaskCommentDto,
  ): Promise<TaskCommentResponse> {
    const { project, task } = await this.resolveTaskInProject(projectIdOrKey, taskId);
    const trimmedContent = dto.content?.trim();

    if (!trimmedContent) {
      throw new BadRequestException('Nội dung bình luận không được để trống');
    }

    const entity = this.commentRepository.create({
      task_id: task.id,
      user_id: userId,
      content: trimmedContent,
      is_edited: false,
    });

    const saved = await this.commentRepository.save(entity);
    const withAuthor = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: { user: true },
    });

    if (this.notificationsService) {
      const recipients = new Set<string>();
      if (task.assignee_id && task.assignee_id !== userId) recipients.add(task.assignee_id);
      if (task.reporter_id && task.reporter_id !== userId) recipients.add(task.reporter_id);

      const authorName = withAuthor?.user?.full_name || 'Thành viên';
      for (const recipientId of recipients) {
        this.notificationsService
          .createNotification({
            userId: recipientId,
            type: NotificationType.COMMENTED,
            title: `Bình luận mới ở ${task.task_key}`,
            message: `${authorName} đã bình luận trong "${task.title}": ${trimmedContent.slice(0, 80)}`,
            data: {
              projectId: project.id,
              projectKey: project.key,
              taskId: task.id,
              taskKey: task.task_key,
            },
          })
          .catch(() => undefined);
      }
    }

    return this.formatComment(withAuthor ?? saved);
  }

  async update(
    projectIdOrKey: string,
    taskId: string,
    commentId: string,
    userId: string,
    dto: UpdateTaskCommentDto,
  ): Promise<TaskCommentResponse> {
    const { task } = await this.resolveTaskInProject(projectIdOrKey, taskId);

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, task_id: task.id },
      relations: { user: true },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận trong công việc này!');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('Chỉ tác giả mới có quyền chỉnh sửa bình luận này');
    }

    const trimmedContent = dto.content?.trim();
    if (!trimmedContent) {
      throw new BadRequestException('Nội dung bình luận không được để trống');
    }

    comment.content = trimmedContent;
    comment.is_edited = true;

    const updated = await this.commentRepository.save(comment);
    return this.formatComment(updated);
  }

  async remove(
    projectIdOrKey: string,
    taskId: string,
    commentId: string,
    userId: string,
  ): Promise<{ deleted: true; id: string }> {
    const { project, task } = await this.resolveTaskInProject(projectIdOrKey, taskId);

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, task_id: task.id },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận trong công việc này!');
    }

    if (comment.user_id !== userId) {
      const canModerate = await this.canModerateComments(project, userId);
      if (!canModerate) {
        throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
      }
    }

    await this.commentRepository.softRemove(comment);
    return { deleted: true, id: comment.id };
  }
}
