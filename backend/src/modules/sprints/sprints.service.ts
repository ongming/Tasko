import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint, SprintStatus } from './entities/sprint.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { StatusCategory } from '../projects/entities/status.entity.js';
import {
  CreateSprintDto,
  UpdateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from './dto/sprint.dto.js';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
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

  async getSprints(identifier: string) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const sprints = await this.sprintRepository.find({
      where: { project_id: project.id },
      order: { position: 'ASC', created_at: 'ASC' },
    });

    const tasks = await this.taskRepository.find({
      where: { project_id: project.id },
      relations: { status: true },
    });

    return sprints.map((sprint) => {
      const sprintTasks = tasks.filter((t) => t.sprint_id === sprint.id);
      const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
      const completedTasks = sprintTasks.filter((t) => t.status?.category === StatusCategory.DONE);
      const completedPoints = completedTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);

      return {
        id: sprint.id,
        projectId: sprint.project_id,
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.start_date,
        endDate: sprint.end_date,
        position: sprint.position,
        taskCount: sprintTasks.length,
        completedTaskCount: completedTasks.length,
        totalPoints,
        completedPoints,
      };
    });
  }

  async createSprint(userId: string, identifier: string, dto: CreateSprintDto) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const existingCount = await this.sprintRepository.count({
      where: { project_id: project.id },
    });

    const name = dto.name?.trim() || `Sprint ${existingCount + 1}`;
    const sprint = this.sprintRepository.create({
      project_id: project.id,
      name,
      goal: dto.goal?.trim() || null,
      status: SprintStatus.PLANNED,
      start_date: dto.startDate ? new Date(dto.startDate) : null,
      end_date: dto.endDate ? new Date(dto.endDate) : null,
      position: dto.position ?? (existingCount + 1) * 1000,
    });

    return this.sprintRepository.save(sprint);
  }

  async updateSprint(userId: string, sprintId: string, dto: UpdateSprintDto) {
    const sprint = await this.sprintRepository.findOne({ where: { id: sprintId } });
    if (!sprint) {
      throw new NotFoundException('Sprint không tồn tại!');
    }

    if (dto.name !== undefined) sprint.name = dto.name.trim();
    if (dto.goal !== undefined) sprint.goal = dto.goal ? dto.goal.trim() : null;
    if (dto.startDate !== undefined) sprint.start_date = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) sprint.end_date = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.status !== undefined) sprint.status = dto.status;
    if (dto.position !== undefined) sprint.position = dto.position;

    return this.sprintRepository.save(sprint);
  }

  async startSprint(userId: string, sprintId: string, dto: StartSprintDto) {
    const sprint = await this.sprintRepository.findOne({ where: { id: sprintId } });
    if (!sprint) {
      throw new NotFoundException('Sprint không tồn tại!');
    }

    const activeSprint = await this.sprintRepository.findOne({
      where: { project_id: sprint.project_id, status: SprintStatus.ACTIVE },
    });
    if (activeSprint && activeSprint.id !== sprint.id) {
      throw new BadRequestException(
        `Dự án hiện đang có ${activeSprint.name} đang hoạt động. Vui lòng hoàn thành Sprint đó trước khi bắt đầu Sprint mới!`,
      );
    }

    // Chặn khi Sprint rỗng (0 task)
    if (typeof this.taskRepository.count === 'function') {
      const taskCount = await this.taskRepository.count({
        where: { sprint_id: sprint.id },
      });
      if (taskCount === 0) {
        throw new BadRequestException('Không thể bắt đầu Sprint rỗng. Vui lòng thêm ít nhất 1 công việc vào Sprint!');
      }
    }

    if (dto.name) sprint.name = dto.name.trim();
    if (dto.goal !== undefined) sprint.goal = dto.goal ? dto.goal.trim() : null;
    sprint.start_date = new Date(dto.startDate);
    sprint.end_date = new Date(dto.endDate);
    sprint.status = SprintStatus.ACTIVE;

    return this.sprintRepository.save(sprint);
  }

  async completeSprint(userId: string, sprintId: string, dto: CompleteSprintDto) {
    const sprint = await this.sprintRepository.findOne({ where: { id: sprintId } });
    if (!sprint) {
      throw new NotFoundException('Sprint không tồn tại!');
    }

    const execute = async (
      taskFinder: (opts: any) => Promise<Task[]>,
      taskSaver: (t: Task) => Promise<Task>,
      sprintSaver: (s: Sprint) => Promise<Sprint>,
    ) => {
      const tasks = await taskFinder({
        where: { sprint_id: sprint.id },
        relations: { status: true },
      });

      const uncompletedTasks = tasks.filter((t) => t.status?.category !== StatusCategory.DONE);

      if (uncompletedTasks.length > 0) {
        const targetSprintId = dto.targetSprintId || null;
        for (const task of uncompletedTasks) {
          task.sprint_id = targetSprintId;
          await taskSaver(task);
        }
      }

      sprint.status = SprintStatus.COMPLETED;
      const completedSprint = await sprintSaver(sprint);

      return {
        sprint: completedSprint,
        completedTaskCount: tasks.length - uncompletedTasks.length,
        uncompletedTaskCount: uncompletedTasks.length,
        movedToSprintId: dto.targetSprintId || null,
      };
    };

    const hasTransaction = Boolean(this.sprintRepository.manager?.transaction);
    if (hasTransaction) {
      return await this.sprintRepository.manager.transaction(async (manager) => {
        return execute(
          (opts) => manager.find(Task, opts),
          (t) => manager.save(t),
          (s) => manager.save(s),
        );
      });
    }

    return await execute(
      (opts) => this.taskRepository.find(opts),
      (t) => this.taskRepository.save(t),
      (s) => this.sprintRepository.save(s),
    );
  }

  async deleteSprint(userId: string, sprintId: string) {
    const sprint = await this.sprintRepository.findOne({ where: { id: sprintId } });
    if (!sprint) {
      throw new NotFoundException('Sprint không tồn tại!');
    }

    await this.taskRepository.update({ sprint_id: sprint.id }, { sprint_id: null });
    await this.sprintRepository.remove(sprint);
    return { success: true };
  }
}
