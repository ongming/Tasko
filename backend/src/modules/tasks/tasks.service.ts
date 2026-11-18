import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority } from './entities/task.entity.js';
import { Status } from '../projects/entities/status.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { CustomField } from '../projects/entities/custom-field.entity.js';
import { CustomFieldValue } from './entities/custom-field-value.entity.js';
import { WorkflowTransition } from '../projects/entities/workflow-transition.entity.js';
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
    @InjectRepository(CustomField)
    private readonly customFieldRepository: Repository<CustomField>,
    @InjectRepository(CustomFieldValue)
    private readonly customFieldValueRepository: Repository<CustomFieldValue>,
    @InjectRepository(WorkflowTransition)
    private readonly workflowTransitionRepository: Repository<WorkflowTransition>,
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

    // Lấy custom fields cho từng task
    const taskIds = tasks.map((t) => t.id);
    let allCustomFieldValues: CustomFieldValue[] = [];
    if (taskIds.length > 0) {
      allCustomFieldValues = await this.customFieldValueRepository
        .createQueryBuilder('cfv')
        .leftJoinAndSelect('cfv.customField', 'cf')
        .where('cfv.task_id IN (:...taskIds)', { taskIds })
        .getMany();
    }

    const cfMap = new Map<string, Array<{ id: string; customFieldId: string; name?: string; fieldType?: string; value: any }>>();
    for (const cfv of allCustomFieldValues) {
      const arr = cfMap.get(cfv.taskId) || [];
      arr.push({
        id: cfv.id,
        customFieldId: cfv.customFieldId,
        name: cfv.customField?.name,
        fieldType: cfv.customField?.fieldType,
        value: cfv.value,
      });
      cfMap.set(cfv.taskId, arr);
    }

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
      customFields: cfMap.get(t.id) || [],
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  }

  async createTask(userId: string, identifier: string, dto: CreateTaskDto) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    // 1. Kiểm tra các CustomField có isRequired === true
    const requiredCustomFields = await this.customFieldRepository.find({
      where: { projectId: project.id, isRequired: true },
    });

    for (const cf of requiredCustomFields) {
      const provided = dto.customFields?.find((f) => f.customFieldId === cf.id);
      const val = provided?.value;
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        throw new BadRequestException(`Trường bắt buộc '${cf.name}' không được để trống!`);
      }
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

    // 2. Lưu CustomFieldValues nếu có
    if (dto.customFields && dto.customFields.length > 0) {
      const cfEntities = dto.customFields.map((cf) =>
        this.customFieldValueRepository.create({
          taskId: saved.id,
          customFieldId: cf.customFieldId,
          value: cf.value,
        }),
      );
      await this.customFieldValueRepository.save(cfEntities);
    }

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

    const customFieldValues = await this.customFieldValueRepository.find({
      where: { taskId: t.id },
      relations: { customField: true },
    });

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
      customFields: customFieldValues.map((cfv) => ({
        id: cfv.id,
        customFieldId: cfv.customFieldId,
        name: cfv.customField?.name,
        fieldType: cfv.customField?.fieldType,
        value: cfv.value,
      })),
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

    // Cập nhật CustomFieldValues nếu có
    if (dto.customFields && dto.customFields.length > 0) {
      for (const cf of dto.customFields) {
        const existing = await this.customFieldValueRepository.findOne({
          where: { taskId: task.id, customFieldId: cf.customFieldId },
        });
        if (existing) {
          existing.value = cf.value;
          await this.customFieldValueRepository.save(existing);
        } else {
          const newCf = this.customFieldValueRepository.create({
            taskId: task.id,
            customFieldId: cf.customFieldId,
            value: cf.value,
          });
          await this.customFieldValueRepository.save(newCf);
        }
      }
    }

    return this.getTaskById(task.id);
  }

  async moveTask(
    userId: string,
    projectIdOrTaskId: string,
    taskIdOrDto: string | MoveTaskDto,
    maybeDto?: MoveTaskDto,
  ) {
    let taskId: string;
    let dto: MoveTaskDto;

    if (typeof taskIdOrDto === 'string') {
      taskId = taskIdOrDto;
      dto = maybeDto!;
    } else {
      taskId = projectIdOrTaskId;
      dto = taskIdOrDto;
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { status: true, type: true },
    });
    if (!task) {
      throw new NotFoundException('Công việc không tồn tại!');
    }

    const effectiveProjectId = task.project_id;
    const targetStatusId = dto.toStatusId || dto.statusId;

    // Trường hợp 1: Sắp xếp lại trong cùng 1 cột
    if (!targetStatusId || targetStatusId === task.status_id) {
      if (dto.sprintId !== undefined) task.sprint_id = dto.sprintId;
      if (dto.position !== undefined) task.position = dto.position;
      await this.taskRepository.save(task);
      return this.getTaskById(task.id);
    }

    // Trường hợp 2: Kéo chuyển sang cột khác
    const toStatus = await this.statusRepository.findOne({
      where: { id: targetStatusId, project_id: effectiveProjectId },
    });
    if (!toStatus) {
      throw new NotFoundException('Trạng thái đích không tồn tại trong dự án!');
    }

    // Bước 1: Kiểm tra Workflow Transition (nếu workType có gán workflowId)
    if (task.type?.workflowId) {
      const transition = await this.workflowTransitionRepository.findOne({
        where: {
          workflowId: task.type.workflowId,
          fromStatusId: task.status_id,
          toStatusId: targetStatusId,
        },
      });
      if (!transition) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái từ '${task.status?.name || 'Hiện tại'}' sang '${toStatus.name}' theo quy trình của loại công việc '${task.type?.name || 'Công việc'}'`,
        );
      }
    }

    // Bước 2: Kiểm tra WIP Limit
    if (toStatus.wipLimit !== null && toStatus.wipLimit !== undefined) {
      const currentCount = await this.taskRepository.count({
        where: { project_id: effectiveProjectId, status_id: targetStatusId },
      });
      if (currentCount >= toStatus.wipLimit) {
        throw new BadRequestException(
          `Cột '${toStatus.name}' đã đạt giới hạn tối đa (WIP Limit: ${toStatus.wipLimit})`,
        );
      }
    }

    // Bước 3: Cập nhật
    task.status_id = targetStatusId;
    if (dto.position !== undefined) task.position = dto.position;
    if (dto.sprintId !== undefined) task.sprint_id = dto.sprintId;

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
