import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
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
import { User } from '../auth/entities/user.entity.js';
import { Role, RoleScope } from '../rbac/entities/role.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';
import {
  AddProjectMemberDto,
  UpdateProjectMemberRoleDto,
  TransferOwnershipDto,
} from './dto/project-member.dto.js';

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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

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

      // 4.1. Tự động thêm Owner vào ProjectMember kèm roleId (OWNER cấp PROJECT)
      const ownerRole = await queryRunner.manager.findOne(Role, {
        where: { name: 'OWNER', scope: RoleScope.PROJECT },
      });

      const projectMember = queryRunner.manager.create(ProjectMember, {
        project_id: savedProject.id,
        user_id: userId,
        role: ProjectRole.OWNER,
        roleId: ownerRole ? ownerRole.id : null,
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
   * 6. LẤY DANH SÁCH THÀNH VIÊN CỦA DỰ ÁN
   */
  async getProjectMembers(identifier: string) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const members = await this.projectMemberRepository.find({
      where: { project_id: project.id },
      relations: { user: true, roleEntity: true },
      order: { joined_at: 'ASC' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.user_id,
      user: {
        id: m.user.id,
        email: m.user.email,
        fullName: m.user.full_name,
        avatarUrl: m.user.avatar_url,
      },
      roleId: m.roleId,
      role: m.roleEntity
        ? { id: m.roleEntity.id, name: m.roleEntity.name }
        : { id: null, name: m.role },
      joinedAt: m.joined_at,
    }));
  }

  /**
   * 7. THÊM THÀNH VIÊN VÀO DỰ ÁN
   */
  async addProjectMember(identifier: string, dto: AddProjectMemberDto) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const role = await this.roleRepository.findOne({
      where: { id: dto.roleId, scope: RoleScope.PROJECT },
    });
    if (!role) {
      throw new BadRequestException('Vai trò không hợp lệ cho Dự án!');
    }

    let user: User | null = null;
    if (dto.userId) {
      user = await this.userRepository.findOne({ where: { id: dto.userId } });
    } else if (dto.email) {
      user = await this.userRepository.findOne({
        where: { email: dto.email.toLowerCase().trim() },
      });
    }

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng!');
    }

    // Kiểm tra user có phải thành viên của Workspace chứa Project không
    const wsMember = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: user.id },
    });
    if (!wsMember) {
      throw new BadRequestException(
        'Người dùng phải là thành viên của Không gian làm việc trước khi thêm vào Dự án!',
      );
    }

    const existingMember = await this.projectMemberRepository.findOne({
      where: { project_id: project.id, user_id: user.id },
    });
    if (existingMember) {
      throw new ConflictException('Người dùng đã là thành viên của dự án!');
    }

    const member = this.projectMemberRepository.create({
      project_id: project.id,
      user_id: user.id,
      roleId: role.id,
      role: role.name === 'VIEWER' ? ProjectRole.VIEWER : ProjectRole.MEMBER,
    });
    const saved = await this.projectMemberRepository.save(member);

    return {
      id: saved.id,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
      },
      roleId: role.id,
      role: { id: role.id, name: role.name },
      joinedAt: saved.joined_at,
    };
  }

  /**
   * 8. ĐỔI VAI TRÒ THÀNH VIÊN TRONG DỰ ÁN
   */
  async updateProjectMemberRole(
    identifier: string,
    targetUserId: string,
    dto: UpdateProjectMemberRoleDto,
  ) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const member = await this.projectMemberRepository.findOne({
      where: { project_id: project.id, user_id: targetUserId },
      relations: { roleEntity: true },
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong dự án!');
    }

    const newRole = await this.roleRepository.findOne({
      where: { id: dto.roleId, scope: RoleScope.PROJECT },
    });
    if (!newRole) {
      throw new BadRequestException('Vai trò mới không hợp lệ cho Dự án!');
    }

    if (newRole.name === 'OWNER') {
      throw new BadRequestException(
        'Không thể gán vai trò Chủ sở hữu qua API này. Vui lòng sử dụng tính năng chuyển quyền sở hữu!',
      );
    }

    if (project.owner_id === targetUserId || member.role === ProjectRole.OWNER) {
      throw new BadRequestException(
        'Không thể đổi vai trò của Chủ sở hữu qua API này. Vui lòng chuyển quyền sở hữu trước!',
      );
    }

    member.roleId = newRole.id;
    member.role = newRole.name === 'VIEWER' ? ProjectRole.VIEWER : ProjectRole.MEMBER;
    await this.projectMemberRepository.save(member);

    return {
      id: member.id,
      userId: member.user_id,
      roleId: newRole.id,
      role: { id: newRole.id, name: newRole.name },
    };
  }

  /**
   * 9. XÓA THÀNH VIÊN KHỎI DỰ ÁN
   */
  async removeProjectMember(identifier: string, targetUserId: string) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const member = await this.projectMemberRepository.findOne({
      where: { project_id: project.id, user_id: targetUserId },
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong dự án!');
    }

    if (project.owner_id === targetUserId || member.role === ProjectRole.OWNER) {
      throw new BadRequestException(
        'Không thể xóa Chủ sở hữu khỏi dự án. Vui lòng chuyển quyền sở hữu trước!',
      );
    }

    await this.projectMemberRepository.remove(member);
    return { success: true, message: 'Đã xóa thành viên khỏi dự án thành công!' };
  }

  /**
   * 10. CHUYỂN QUYỀN SỞ HỮU DỰ ÁN
   */
  async transferOwnership(
    userId: string,
    identifier: string,
    dto: TransferOwnershipDto,
  ) {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    if (project.owner_id === dto.targetUserId) {
      throw new BadRequestException('Người dùng đã là Chủ sở hữu của dự án này!');
    }

    const targetMember = await this.projectMemberRepository.findOne({
      where: { project_id: project.id, user_id: dto.targetUserId },
    });
    if (!targetMember) {
      throw new BadRequestException(
        'Người nhận chuyển giao quyền sở hữu phải là thành viên của dự án!',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ownerRole = await queryRunner.manager.findOne(Role, {
        where: { name: 'OWNER', scope: RoleScope.PROJECT },
      });
      const memberRole = await queryRunner.manager.findOne(Role, {
        where: { name: 'MEMBER', scope: RoleScope.PROJECT },
      });

      // 1. Cập nhật Project.owner_id
      await queryRunner.manager.update(
        Project,
        { id: project.id },
        { owner_id: dto.targetUserId },
      );

      // 2. Nâng targetUserId thành OWNER
      await queryRunner.manager.update(
        ProjectMember,
        { project_id: project.id, user_id: dto.targetUserId },
        {
          role: ProjectRole.OWNER,
          roleId: ownerRole ? ownerRole.id : null,
        },
      );

      // 3. Hạ owner cũ xuống MEMBER
      await queryRunner.manager.update(
        ProjectMember,
        { project_id: project.id, user_id: project.owner_id },
        {
          role: ProjectRole.MEMBER,
          roleId: memberRole ? memberRole.id : null,
        },
      );

      await queryRunner.commitTransaction();
      return { success: true, message: 'Chuyển quyền sở hữu dự án thành công!' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 11. XÓA MỀM DỰ ÁN (THEO ID HOẶC KEY)
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

    await this.projectRepository.softRemove(project);
  }

  /**
   * CẬP NHẬT CẤU HÌNH (SETTINGS) CỦA DỰ ÁN
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
      ...project.settings,
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
