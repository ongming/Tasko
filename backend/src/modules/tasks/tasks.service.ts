import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority } from './entities/task.entity.js';
import { Status, StatusCategory } from '../projects/entities/status.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { CustomField } from '../projects/entities/custom-field.entity.js';
import { CustomFieldValue } from './entities/custom-field-value.entity.js';
import { WorkflowTransition } from '../projects/entities/workflow-transition.entity.js';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto, TaskQueryDto } from './dto/task.dto.js';

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

  async getTasks(identifier: string, query?: TaskQueryDto) {
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
      .leftJoinAndSelect('task.sprint', 'sprint')
      .leftJoinAndSelect('task.parentTask', 'parentTask')
      .where('task.project_id = :projectId', { projectId: project.id });

    // 1. Tìm kiếm (Search theo title hoặc task_key)
    if (query?.search?.trim()) {
      const s = `%${query.search.trim()}%`;
      qb.andWhere('(task.title ILIKE :search OR task.task_key ILIKE :search)', { search: s });
    }

    // 2. Lọc theo sprintId / isBacklog
    if (
      query?.isBacklog === true ||
      query?.isBacklog === 'true' ||
      query?.sprintId === 'backlog' ||
      query?.sprintId === 'null'
    ) {
      qb.andWhere('task.sprint_id IS NULL')
        .andWhere('status.category != :doneCategory', { doneCategory: StatusCategory.DONE })
        .andWhere('task.parent_task_id IS NULL');
    } else if (query?.sprintId) {
      qb.andWhere('task.sprint_id = :sprintId', { sprintId: query.sprintId });
    }

    // 3. Lọc theo statusId
    if (query?.statusId) {
      qb.andWhere('task.status_id = :statusId', { statusId: query.statusId });
    }

    // 4. Lọc theo workTypeId
    if (query?.workTypeId) {
      qb.andWhere('task.type_id = :workTypeId', { workTypeId: query.workTypeId });
    }

    // 5. Lọc theo assigneeId
    if (query?.assigneeId) {
      if (query.assigneeId === 'unassigned') {
        qb.andWhere('task.assignee_id IS NULL');
      } else {
        qb.andWhere('task.assignee_id = :assigneeId', { assigneeId: query.assigneeId });
      }
    }

    // 6. Lọc theo priority
    if (query?.priority) {
      qb.andWhere('task.priority = :priority', { priority: query.priority });
    }

    // 7. Sắp xếp (Sort)
    const sortOrder = query?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (query?.sortBy === 'dueDate') {
      qb.orderBy('task.due_date', sortOrder).addOrderBy('task.position', 'ASC');
    } else if (query?.sortBy === 'priority') {
      qb.orderBy('task.priority', sortOrder).addOrderBy('task.position', 'ASC');
    } else if (query?.sortBy === 'createdAt') {
      qb.orderBy('task.created_at', sortOrder);
    } else {
      qb.orderBy('task.position', sortOrder).addOrderBy('task.created_at', 'ASC');
    }

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

    const cfMap = new Map<
      string,
      Array<{
        id: string;
        customFieldId: string;
        name?: string;
        fieldType?: string;
        options?: string[] | null;
        isRequired?: boolean;
        value: any;
      }>
    >();
    for (const cfv of allCustomFieldValues) {
      const arr = cfMap.get(cfv.taskId) || [];
      arr.push({
        id: cfv.id,
        customFieldId: cfv.customFieldId,
        name: cfv.customField?.name,
        fieldType: cfv.customField?.fieldType,
        options: cfv.customField?.options,
        isRequired: cfv.customField?.isRequired,
        value: cfv.value,
      });
      cfMap.set(cfv.taskId, arr);
    }

    return tasks.map((t) => ({
      id: t.id,
      projectId: t.project_id,
      sprintId: t.sprint_id,
      sprint: t.sprint ? { id: t.sprint.id, name: t.sprint.name, status: t.sprint.status } : null,
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
      reporterId: t.reporter_id,
      reporter: t.reporter ? { id: t.reporter.id, name: t.reporter.full_name, avatarUrl: t.reporter.avatar_url } : null,
      position: t.position,
      parentTaskId: t.parent_task_id,
      parentTask: t.parentTask ? { id: t.parentTask.id, taskKey: t.parentTask.task_key, title: t.parentTask.title } : null,
      estimatedHours: t.estimated_hours ? Number(t.estimated_hours) : null,
      startDate: t.start_date,
      dueDate: t.due_date,
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

    // 1. Kiểm tra nếu có parentTaskId (Subtask)
    if (dto.parentTaskId) {
      const parentTask = await this.taskRepository.findOne({
        where: { id: dto.parentTaskId },
      });
      if (!parentTask) {
        throw new NotFoundException('Công việc cha không tồn tại!');
      }
      if (parentTask.project_id !== project.id) {
        throw new BadRequestException('Công việc cha không thuộc dự án này!');
      }
      if (parentTask.parent_task_id) {
        throw new BadRequestException('Không thể tạo subtask cho một subtask khác (chỉ hỗ trợ tối đa 1 cấp subtask)!');
      }
    }

    // 2. Kiểm tra các CustomField có isRequired === true
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

    // 3. Đếm số lượng task (bao gồm cả task đã xóa mềm với withDeleted: true để không trùng mã task_key)
    const count = await this.taskRepository.count({
      where: { project_id: project.id },
      withDeleted: true,
    });
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
      parent_task_id: dto.parentTaskId || null,
      estimated_hours: dto.estimatedHours ?? null,
      start_date: dto.startDate ? new Date(dto.startDate) : null,
      due_date: dto.dueDate ? new Date(dto.dueDate) : null,
    });

    const saved = await this.taskRepository.save(task);

    // 4. Lưu CustomFieldValues nếu có
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
      relations: {
        status: true,
        type: true,
        assignee: true,
        reporter: true,
        sprint: true,
        parentTask: true,
        subtasks: {
          status: true,
          type: true,
          assignee: true,
        },
      },
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
      sprint: t.sprint ? { id: t.sprint.id, name: t.sprint.name, status: t.sprint.status } : null,
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
      reporterId: t.reporter_id,
      reporter: t.reporter ? { id: t.reporter.id, name: t.reporter.full_name, avatarUrl: t.reporter.avatar_url } : null,
      position: t.position,
      parentTaskId: t.parent_task_id,
      parentTask: t.parentTask ? { id: t.parentTask.id, taskKey: t.parentTask.task_key, title: t.parentTask.title } : null,
      subtasks: (t.subtasks || []).map((sub) => ({
        id: sub.id,
        projectId: sub.project_id,
        taskKey: sub.task_key,
        title: sub.title,
        statusId: sub.status_id,
        status: sub.status ? { id: sub.status.id, name: sub.status.name, category: sub.status.category, color: sub.status.color } : null,
        typeId: sub.type_id,
        type: sub.type ? { id: sub.type.id, name: sub.type.name, icon: sub.type.icon, color: sub.type.color } : null,
        assigneeId: sub.assignee_id,
        assignee: sub.assignee ? { id: sub.assignee.id, name: sub.assignee.full_name, avatarUrl: sub.assignee.avatar_url } : null,
        priority: sub.priority,
        storyPoints: sub.story_points,
        position: sub.position,
        dueDate: sub.due_date,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
      })),
      estimatedHours: t.estimated_hours ? Number(t.estimated_hours) : null,
      startDate: t.start_date,
      dueDate: t.due_date,
      customFields: customFieldValues.map((cfv) => ({
        id: cfv.id,
        customFieldId: cfv.customFieldId,
        name: cfv.customField?.name,
        fieldType: cfv.customField?.fieldType,
        options: cfv.customField?.options,
        isRequired: cfv.customField?.isRequired,
        value: cfv.value,
      })),
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { status: true, type: true },
    });
    if (!task) {
      throw new NotFoundException('Công việc không tồn tại!');
    }

    // 1. Kiểm tra WorkflowTransition và WIP Limit nếu thay đổi statusId
    if (dto.statusId !== undefined && dto.statusId !== task.status_id) {
      const toStatus = await this.statusRepository.findOne({
        where: { id: dto.statusId, project_id: task.project_id },
      });
      if (!toStatus) {
        throw new NotFoundException('Trạng thái đích không tồn tại trong dự án!');
      }

      // Kiểm tra Workflow Transition (nếu workType có gán workflowId)
      if (task.type?.workflowId) {
        const transition = await this.workflowTransitionRepository.findOne({
          where: {
            workflowId: task.type.workflowId,
            fromStatusId: task.status_id,
            toStatusId: dto.statusId,
          },
        });
        if (!transition) {
          throw new BadRequestException(
            `Không thể chuyển trạng thái từ '${task.status?.name || 'Hiện tại'}' sang '${toStatus.name}' theo quy trình của loại công việc '${task.type?.name || 'Công việc'}'`,
          );
        }
      }

      // Kiểm tra WIP Limit
      if (toStatus.wipLimit !== null && toStatus.wipLimit !== undefined) {
        const currentCount = await this.taskRepository.count({
          where: { project_id: task.project_id, status_id: dto.statusId },
        });
        if (currentCount >= toStatus.wipLimit) {
          throw new BadRequestException(
            `Cột '${toStatus.name}' đã đạt giới hạn tối đa (WIP Limit: ${toStatus.wipLimit})`,
          );
        }
      }

      task.status_id = dto.statusId;
    }

    // 2. Kiểm tra parentTaskId nếu cập nhật
    if (dto.parentTaskId !== undefined) {
      if (dto.parentTaskId === task.id) {
        throw new BadRequestException('Công việc không thể tự làm công việc cha của chính nó!');
      }
      if (dto.parentTaskId) {
        const parentTask = await this.taskRepository.findOne({
          where: { id: dto.parentTaskId },
        });
        if (!parentTask) {
          throw new NotFoundException('Công việc cha không tồn tại!');
        }
        if (parentTask.project_id !== task.project_id) {
          throw new BadRequestException('Công việc cha không thuộc dự án này!');
        }
        if (parentTask.parent_task_id) {
          throw new BadRequestException('Không thể chọn một subtask làm cha!');
        }
      }
      task.parent_task_id = dto.parentTaskId;
    }

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) task.description = dto.description ? dto.description.trim() : null;
    if (dto.sprintId !== undefined) task.sprint_id = dto.sprintId;
    if (dto.typeId !== undefined) task.type_id = dto.typeId;
    if (dto.storyPoints !== undefined) task.story_points = dto.storyPoints;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.assigneeId !== undefined) task.assignee_id = dto.assigneeId;
    if (dto.position !== undefined) task.position = dto.position;
    if (dto.estimatedHours !== undefined) task.estimated_hours = dto.estimatedHours;
    if (dto.startDate !== undefined) task.start_date = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.dueDate !== undefined) task.due_date = dto.dueDate ? new Date(dto.dueDate) : null;

    await this.taskRepository.save(task);

    // 3. Cập nhật CustomFieldValues nếu có
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
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { subtasks: true },
    });
    if (!task) {
      throw new NotFoundException('Công việc không tồn tại!');
    }

    // Xóa mềm cả subtasks con trong Transaction
    const hasTransaction = Boolean(this.taskRepository.manager?.transaction);
    if (hasTransaction) {
      await this.taskRepository.manager.transaction(async (manager) => {
        if (task.subtasks && task.subtasks.length > 0) {
          if (typeof manager.softRemove === 'function') {
            await manager.softRemove(task.subtasks);
          } else {
            await manager.remove(task.subtasks);
          }
        }
        if (typeof manager.softRemove === 'function') {
          await manager.softRemove(task);
        } else {
          await manager.remove(task);
        }
      });
    } else {
      if (task.subtasks && task.subtasks.length > 0) {
        if (typeof this.taskRepository.softRemove === 'function') {
          await this.taskRepository.softRemove(task.subtasks);
        } else if (typeof this.taskRepository.remove === 'function') {
          await this.taskRepository.remove(task.subtasks);
        }
      }
      if (typeof this.taskRepository.softRemove === 'function') {
        await this.taskRepository.softRemove(task);
      } else if (typeof this.taskRepository.remove === 'function') {
        await this.taskRepository.remove(task);
      }
    }

    return { success: true };
  }
}
