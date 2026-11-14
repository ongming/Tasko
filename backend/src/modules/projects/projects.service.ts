import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Project } from './entities/project.entity.js';
import { Status, StatusCategory } from './entities/status.entity.js';
import { WorkType } from './entities/work-type.entity.js';
import { ProjectMember, ProjectRole } from './entities/project-member.entity.js';
import { Workspace } from '../workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';

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
   * 3. LẤY CHI TIẾT 1 DỰ ÁN THEO ID
   */
  async findById(userId: string, projectId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
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
   * 4. LẤY DANH SÁCH STATUS (CÁC CỘT KANBAN) CỦA DỰ ÁN
   */
  async findStatusesByProject(userId: string, projectId: string): Promise<Status[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
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
      where: { project_id: projectId },
      order: { position: 'ASC' },
    });
  }

  /**
   * 5. LẤY DANH SÁCH LOẠI CÔNG VIỆC (WORK TYPES) CỦA DỰ ÁN
   */
  async findWorkTypesByProject(userId: string, projectId: string): Promise<WorkType[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
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
      where: { project_id: projectId },
      order: { created_at: 'ASC' },
    });
  }

  private mapToResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      key: project.key,
      color: project.color,
      description: project.description,
      workspaceId: project.workspace_id,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }
}
