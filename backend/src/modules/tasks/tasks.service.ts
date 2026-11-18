import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority } from './entities/task.entity.js';
import { Status } from '../projects/entities/status.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    @InjectRepository(WorkType)
    private readonly workTypeRepository: Repository<WorkType>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  private isUuid(val: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  }

  private async findProjectEntity(identifier: string): Promise<Project | null> {
    if (this.isUuid(identifier)) {
      return this.projectRepository.findOne({ where: { id: identifier } });
    }
    const byKey = await this.projectRepository.findOne({ where: { key: identifier.toUpperCase() } });
    if (byKey) return byKey;
    return this.projectRepository.findOne({ where: { id: identifier } });
  }

  async getTasks(identifier: string, query?: { sprintId?: string; isBacklog?: boolean | string }) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.status', 'status')
      .leftJoinAndSelect('task.type', 'type')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.reporter', 'reporter')
      .where('task.project_id = :projectId', { projectId: project.id });

    if (query?.isBacklog === true || query?.isBacklog === 'true') {
      qb.andWhere('task.sprint_id IS NULL');
    } else if (query?.sprintId) {
      qb.andWhere('task.sprint_id = :sprintId', { sprintId: query.sprintId });
    }

    qb.orderBy('task.position', 'ASC').addOrderBy('task.created_at', 'ASC');

    const tasks = await qb.getMany();

    return tasks.map((t) => ({
      id: t.id,
      projectId: t.project_id,
      sprintId: t.sprint_id,
      taskKey: t.task_key,
      title: t.title,
      description: t.description,
      typeId: t.type_id,
      type: t.type ? { id: t.type.id, name: t.type.name, icon: t.type.icon, color: t.type.color } : null,
      statusId: t.status_id,
      status: t.status ? { id: t.status.id, name: t.status.name, category: t.status.category, color: t.status.color } : null,
      storyPoints: t.story_points,
      priority: t.priority,
      assigneeId: t.assignee_id,
      assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.full_name, avatarUrl: t.assignee.avatar_url } : null,
      position: t.position,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  }

  async createTask(userId: string, identifier: string, dto: CreateTaskDto) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const count = await this.taskRepository.count({ where: { project_id: project.id } });
    const taskKey = `${project.key}-${count + 1}`;

    let statusId = dto.statusId;
    if (!statusId) {
      const defaultStatus =
        (await this.statusRepository.findOne({
          where: { project_id: project.id, is_default: true },
        })) ||
        (await this.statusRepository.findOne({
          where: { project_id: project.id },
          order: { position: 'ASC' },
        }));
      if (!defaultStatus) {
        throw new BadRequestException('Dự án chưa có trạng thái công việc!');
      }
      statusId = defaultStatus.id;
    }

    let typeId = dto.typeId;
    if (!typeId) {
      const defaultType =
        (await this.workTypeRepository.findOne({
          where: { project_id: project.id, is_default: true },
        })) ||
        (await this.workTypeRepository.findOne({
          where: { project_id: project.id },
          order: { created_at: 'ASC' },
        }));
      if (defaultType) {
        typeId = defaultType.id;
      }
    }

    const task = this.taskRepository.create({
      project_id: project.id,
      sprint_id: dto.sprintId || null,
      task_key: taskKey,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      type_id: typeId || null,
      status_id: statusId,
      story_points: dto.storyPoints ?? null,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      assignee_id: dto.assigneeId || null,
      reporter_id: userId,
      position: dto.position ?? (count + 1) * 1000,
    });

    const saved = await this.taskRepository.save(task);
    return this.getTaskById(saved.id);
  }

  async getTaskById(taskId: string) {
    const t = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { status: true, type: true, assignee: true, reporter: true },
    });
    if (!t) {
      throw new NotFoundException('Công việc không tồn tại!');
    }
    return {
      id: t.id,
      projectId: t.project_id,
      sprintId: t.sprint_id,
      taskKey: t.task_key,
      title: t.title,
      description: t.description,
      typeId: t.type_id,
      type: t.type ? { id: t.type.id, name: t.type.name, icon: t.type.icon, color: t.type.color } : null,
      statusId: t.status_id,
      status: t.status ? { id: t.status.id, name: t.status.name, category: t.status.category, color: t.status.color } : null,
      storyPoints: t.story_points,
      priority: t.priority,
      assigneeId: t.assignee_id,
      assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.full_name, avatarUrl: t.assignee.avatar_url } : null,
      position: t.position,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Công việc không tồn tại!');
    }

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) task.description = dto.description ? dto.description.trim() : null;
    if (dto.sprintId !== undefined) task.sprint_id = dto.sprintId;
    if (dto.typeId !== undefined) task.type_id = dto.typeId;
    if (dto.statusId !== undefined) task.status_id = dto.statusId;
    if (dto.storyPoints !== undefined) task.story_points = dto.storyPoints;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.assigneeId !== undefined) task.assignee_id = dto.assigneeId;
    if (dto.position !== undefined) task.position = dto.position;

    await this.taskRepository.save(task);
    return this.getTaskById(task.id);
  }

  async moveTask(userId: string, taskId: string, dto: MoveTaskDto) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Công việc không tồn tại!');
    }

    if (dto.sprintId !== undefined) task.sprint_id = dto.sprintId;
    if (dto.statusId !== undefined) task.status_id = dto.statusId;
    if (dto.position !== undefined) task.position = dto.position;

    await this.taskRepository.save(task);
    return this.getTaskById(task.id);
  }

  async deleteTask(userId: string, taskId: string) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Công việc không tồn tại!');
    }
    await this.taskRepository.remove(task);
    return { success: true };
  }
}
