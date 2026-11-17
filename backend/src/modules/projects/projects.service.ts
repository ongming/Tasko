import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, IsNull } from 'typeorm';
import { Project } from './entities/project.entity.js';
import { Status, StatusCategory } from './entities/status.entity.js';
import { WorkType } from './entities/work-type.entity.js';
import { ProjectMember, ProjectRole } from './entities/project-member.entity.js';
import { Sprint, SprintStatus } from './entities/sprint.entity.js';
import { Task, TaskPriority } from './entities/task.entity.js';
import { Workspace } from '../workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';
import {
  CreateSprintDto,
  UpdateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from './dto/sprint.dto.js';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
} from './dto/task.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,

    @InjectRepository(WorkType)
    private readonly workTypeRepository: Repository<WorkType>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,

    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * 1. TẠO DỰ ÁN MỚI
   */
  async create(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const normalizedName = dto.name.trim();
    const normalizedKey = dto.key.trim().toUpperCase();
    const normalizedDescription = dto.description?.trim() || null;
    const color = dto.color?.trim() || 'bg-indigo-600';

    // 1. Kiểm tra Workspace tồn tại
    const workspace = await this.workspaceRepository.findOne({
      where: { id: dto.workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Không gian làm việc không tồn tại!');
    }

    // 2. Kiểm tra tư cách thành viên & quyền hạn
    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: dto.workspaceId, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không phải là thành viên của không gian làm việc này!');
    }

    if (member.role === WorkspaceRole.VIEWER) {
      throw new ForbiddenException('Thành viên chỉ xem (VIEWER) không có quyền tạo dự án mới!');
    }

    // 3. Kiểm tra tính duy nhất của Key trong cùng một Workspace
    const existingProject = await this.projectRepository.findOne({
      where: { workspace_id: dto.workspaceId, key: normalizedKey },
    });
    if (existingProject) {
      throw new ConflictException(
        `Mã dự án "${normalizedKey}" đã tồn tại trong không gian làm việc này! Vui lòng chọn mã khác.`,
      );
    }

    // 4. Tạo và lưu bản ghi Project cùng Status, WorkType và ProjectMember trong 1 Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newProject = queryRunner.manager.create(Project, {
        name: normalizedName,
        key: normalizedKey,
        color,
        description: normalizedDescription,
        settings: dto.settings || {},
        workspace_id: dto.workspaceId,
        owner_id: userId,
      });

      const savedProject = await queryRunner.manager.save(Project, newProject);

      // 4.1. Tự động thêm Owner vào ProjectMember
      const projectMember = queryRunner.manager.create(ProjectMember, {
        project_id: savedProject.id,
        user_id: userId,
        role: ProjectRole.OWNER,
      });
      await queryRunner.manager.save(ProjectMember, projectMember);

      // 4.2. Tự động sinh các Cột Status / Workflow
      const defaultWorkflow = [
        { label: 'Backlog', category: StatusCategory.TODO, color: '#94a3b8' },
        { label: 'In Progress', category: StatusCategory.IN_PROGRESS, color: '#4f46e5' },
        { label: 'Review', category: StatusCategory.IN_PROGRESS, color: '#f59e0b' },
        { label: 'Done', category: StatusCategory.DONE, color: '#10b981' },
      ];

      const workflowToCreate = (dto.workflow && dto.workflow.length > 0)
        ? dto.workflow.map((item, idx) => {
            let cat = StatusCategory.IN_PROGRESS;
            if (idx === 0) cat = StatusCategory.TODO;
            else if (idx === dto.workflow!.length - 1) cat = StatusCategory.DONE;
            if (item.category) cat = item.category as StatusCategory;
            return {
              label: item.label,
              category: cat,
              color: item.color || (cat === StatusCategory.TODO ? '#94a3b8' : cat === StatusCategory.DONE ? '#10b981' : '#4f46e5'),
            };
          })
        : defaultWorkflow;

      const statusEntities = workflowToCreate.map((wf, index) =>
        queryRunner.manager.create(Status, {
          project_id: savedProject.id,
          name: wf.label,
          category: wf.category,
          color: wf.color,
          position: (index + 1) * 1000,
          is_default: index === 0,
        }),
      );
      await queryRunner.manager.save(Status, statusEntities);

      // 4.3. Tự động sinh các Loại công việc (WorkType)
      const defaultWorkTypes = [
        { label: 'Module', icon: 'Package', color: 'bg-purple-100 text-purple-700' },
        { label: 'Task', icon: 'CheckSquare', color: 'bg-blue-100 text-blue-700' },
        { label: 'Bug', icon: 'Bug', color: 'bg-rose-100 text-rose-700' },
      ];

      const workTypesToCreate = (dto.workTypes && dto.workTypes.length > 0)
        ? dto.workTypes
        : defaultWorkTypes;

      const workTypeEntities = workTypesToCreate.map((wt, index) =>
        queryRunner.manager.create(WorkType, {
          project_id: savedProject.id,
          name: wt.label,
          icon: wt.icon || 'CheckSquare',
          color: wt.color || 'bg-blue-100 text-blue-700',
          is_default: index === 0,
        }),
      );
      await queryRunner.manager.save(WorkType, workTypeEntities);

      await queryRunner.commitTransaction();
      return this.mapToResponse(savedProject);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 2. LẤY DANH SÁCH DỰ ÁN THEO WORKSPACE HOẶC TẤT CẢ DỰ ÁN CỦA USER
   */
  async findAllByWorkspace(userId: string, workspaceId?: string): Promise<ProjectResponseDto[]> {
    if (workspaceId) {
      const member = await this.workspaceMemberRepository.findOne({
        where: { workspace_id: workspaceId, user_id: userId },
      });
      if (!member) {
        throw new ForbiddenException('Bạn không có quyền truy cập danh sách dự án của không gian này!');
      }

      const projects = await this.projectRepository.find({
        where: { workspace_id: workspaceId },
        order: { created_at: 'DESC' },
      });

      return projects.map((p) => this.mapToResponse(p));
    }

    const userMemberships = await this.workspaceMemberRepository.find({
      where: { user_id: userId },
    });
    const userWorkspaceIds = userMemberships.map((m) => m.workspace_id);
    if (userWorkspaceIds.length === 0) return [];

    const projects = await this.projectRepository.find({
      where: { workspace_id: In(userWorkspaceIds) },
      order: { created_at: 'DESC' },
    });

    return projects.map((p) => this.mapToResponse(p));
  }

  /**
   * Helper: Tìm dự án theo UUID hoặc Key (hỗ trợ phân giải linh hoạt như Jira)
   */
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

  /**
   * 3. LẤY CHI TIẾT 1 DỰ ÁN THEO ID HOẶC KEY
   */
  async findById(userId: string, identifier: string): Promise<ProjectResponseDto> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa!');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin dự án này!');
    }

    return this.mapToResponse(project);
  }

  /**
   * 4. LẤY DANH SÁCH STATUS (CÁC CỘT KANBAN) CỦA DỰ ÁN (THEO ID HOẶC KEY)
   */
  async findStatusesByProject(userId: string, identifier: string): Promise<Status[]> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không có quyền truy cập trạng thái dự án này!');
    }

    return this.statusRepository.find({
      where: { project_id: project.id },
      order: { position: 'ASC' },
    });
  }

  /**
   * 5. LẤY DANH SÁCH LOẠI CÔNG VIỆC (WORK TYPES) CỦA DỰ ÁN (THEO ID HOẶC KEY)
   */
  async findWorkTypesByProject(userId: string, identifier: string): Promise<WorkType[]> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không có quyền truy cập loại công việc của dự án này!');
    }

    return this.workTypeRepository.find({
      where: { project_id: project.id },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * ==========================================
   * PHẦN NGHIỆP VỤ SPRINT (SCRUM)
   * ==========================================
   */

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

    const tasks = await this.taskRepository.find({
      where: { sprint_id: sprint.id },
      relations: { status: true },
    });

    const uncompletedTasks = tasks.filter((t) => t.status?.category !== StatusCategory.DONE);

    if (uncompletedTasks.length > 0) {
      const targetSprintId = dto.targetSprintId || null;
      for (const task of uncompletedTasks) {
        task.sprint_id = targetSprintId;
        await this.taskRepository.save(task);
      }
    }

    sprint.status = SprintStatus.COMPLETED;
    const completedSprint = await this.sprintRepository.save(sprint);

    return {
      sprint: completedSprint,
      completedTaskCount: tasks.length - uncompletedTasks.length,
      uncompletedTaskCount: uncompletedTasks.length,
      movedToSprintId: dto.targetSprintId || null,
    };
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

  /**
   * ==========================================
   * PHẦN NGHIỆP VỤ TASK / ISSUE
   * ==========================================
   */

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

  /**
   * 6. XÓA DỰ ÁN (THEO ID HOẶC KEY)
   */
  async delete(userId: string, identifier: string): Promise<void> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa!');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không thuộc không gian làm việc này!');
    }

    const isProjectOwner = project.owner_id === userId;
    const isWorkspaceAdminOrOwner =
      member.role === WorkspaceRole.OWNER || member.role === WorkspaceRole.ADMIN;

    if (!isProjectOwner && !isWorkspaceAdminOrOwner) {
      throw new ForbiddenException('Chỉ chủ sở hữu dự án hoặc Quản trị viên mới có quyền xóa dự án!');
    }

    await this.projectRepository.remove(project);
  }

  /**
   * CẬP NHẬT CẤU HÌNH (SETTINGS) CỦA DỰ ÁN (Ví dụ: views, tabs, method)
   */
  async updateSettings(
    userId: string,
    idOrKey: string,
    settings: Record<string, any>,
  ): Promise<ProjectResponseDto> {
    const project = await this.findProjectEntity(idOrKey);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa!');
    }
    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không thuộc không gian làm việc này!');
    }

    project.settings = {
      ...(project.settings || {}),
      ...settings,
    };

    const saved = await this.projectRepository.save(project);
    return this.mapToResponse(saved);
  }

  private mapToResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      key: project.key,
      color: project.color,
      description: project.description,
      settings: project.settings || {},
      workspaceId: project.workspace_id,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }
}
