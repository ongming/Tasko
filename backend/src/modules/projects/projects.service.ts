import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Project, ProjectMethodology } from './entities/project.entity.js';
import { Status, StatusCategory } from './entities/status.entity.js';
import { WorkType } from './entities/work-type.entity.js';
import { ProjectMember, ProjectRole } from './entities/project-member.entity.js';
import { Workflow } from './entities/workflow.entity.js';
import { WorkflowTransition } from './entities/workflow-transition.entity.js';
import { CustomField, CustomFieldType } from './entities/custom-field.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
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
import {
  CreateWorkTypeDto,
  UpdateWorkTypeDto,
  DeleteWorkTypeDto,
  CreateStatusDto,
  UpdateStatusDto,
  DeleteStatusDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  UpdateWorkflowTransitionsDto,
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  UpdateProjectSettingsDto,
} from './dto/project-config.dto.js';

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

    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,

    @InjectRepository(WorkflowTransition)
    private readonly workflowTransitionRepository: Repository<WorkflowTransition>,

    @InjectRepository(CustomField)
    private readonly customFieldRepository: Repository<CustomField>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

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
   * Helper kiểm tra UUID
   */
  private isUuid(val: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  }

  /**
   * Helper tìm Project Entity theo ID hoặc Key
   */
  async findProjectEntity(identifier: string): Promise<Project | null> {
    if (this.isUuid(identifier)) {
      const byId = await this.projectRepository.findOne({ where: { id: identifier } });
      if (byId) return byId;
    }
    const byKey = await this.projectRepository.findOne({
      where: { key: identifier.toUpperCase() },
    });
    if (byKey) return byKey;
    return this.projectRepository.findOne({ where: { id: identifier } });
  }

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

    // 4. Tạo và lưu bản ghi Project cùng Status, WorkType, Workflow, Transitions và ProjectMember trong 1 Transaction
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

      // 4.2. Tự động sinh các Cột Status mặc định (To Do, In Progress, Done)
      const defaultWorkflow = [
        { label: 'To Do', category: StatusCategory.TODO, color: '#94a3b8' },
        { label: 'In Progress', category: StatusCategory.IN_PROGRESS, color: '#4f46e5' },
        { label: 'Done', category: StatusCategory.DONE, color: '#10b981' },
      ];

      const workflowToCreate =
        dto.workflow && dto.workflow.length > 0
          ? dto.workflow.map((item, idx) => {
              let cat = StatusCategory.IN_PROGRESS;
              if (idx === 0) cat = StatusCategory.TODO;
              else if (idx === dto.workflow!.length - 1) cat = StatusCategory.DONE;
              if (item.category) cat = item.category as StatusCategory;
              return {
                label: item.label,
                category: cat,
                color:
                  item.color ||
                  (cat === StatusCategory.TODO
                    ? '#94a3b8'
                    : cat === StatusCategory.DONE
                    ? '#10b981'
                    : '#4f46e5'),
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
      const savedStatuses = await queryRunner.manager.save(Status, statusEntities);

      // 4.3. Tạo 1 bản ghi Workflow mặc định ('Default Workflow') thuộc project.id
      const defaultWf = queryRunner.manager.create(Workflow, {
        projectId: savedProject.id,
        name: 'Default Workflow',
      });
      const savedWorkflow = await queryRunner.manager.save(Workflow, defaultWf);

      // 4.4. Tạo 6 bản ghi WorkflowTransition chuyển đổi hai chiều linh hoạt giữa 3 trạng thái mặc định
      const sTodo =
        savedStatuses.find((s) => s.category === StatusCategory.TODO) || savedStatuses[0];
      const sInProgress =
        savedStatuses.find((s) => s.category === StatusCategory.IN_PROGRESS) ||
        (savedStatuses.length > 1 ? savedStatuses[1] : savedStatuses[0]);
      const sDone =
        savedStatuses.find((s) => s.category === StatusCategory.DONE) ||
        savedStatuses[savedStatuses.length - 1];

      if (sTodo && sInProgress && sDone && sTodo.id !== sInProgress.id && sInProgress.id !== sDone.id) {
        const transitionsToCreate = [
          { fromStatusId: sTodo.id, toStatusId: sInProgress.id },
          { fromStatusId: sInProgress.id, toStatusId: sTodo.id },
          { fromStatusId: sInProgress.id, toStatusId: sDone.id },
          { fromStatusId: sDone.id, toStatusId: sInProgress.id },
          { fromStatusId: sTodo.id, toStatusId: sDone.id },
          { fromStatusId: sDone.id, toStatusId: sTodo.id },
        ];

        const transitionEntities = transitionsToCreate.map((t) =>
          queryRunner.manager.create(WorkflowTransition, {
            workflowId: savedWorkflow.id,
            fromStatusId: t.fromStatusId,
            toStatusId: t.toStatusId,
            conditions: {},
          }),
        );
        await queryRunner.manager.save(WorkflowTransition, transitionEntities);
      }

      // 4.5. Tự động sinh các Loại công việc (WorkType) và gán workflowId của Default Workflow
      const defaultWorkTypes = [
        { label: 'Task', icon: 'CheckSquare', color: 'bg-blue-100 text-blue-700' },
        { label: 'Bug', icon: 'Bug', color: 'bg-rose-100 text-rose-700' },
        { label: 'Story', icon: 'BookOpen', color: 'bg-purple-100 text-purple-700' },
      ];

      const workTypesToCreate =
        dto.workTypes && dto.workTypes.length > 0 ? dto.workTypes : defaultWorkTypes;

      const workTypeEntities = workTypesToCreate.map((wt, index) =>
        queryRunner.manager.create(WorkType, {
          project_id: savedProject.id,
          name: wt.label,
          icon: wt.icon || 'CheckSquare',
          color: wt.color || 'bg-blue-100 text-blue-700',
          is_default: index === 0,
          workflowId: savedWorkflow.id,
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
        throw new ForbiddenException('Bạn không thuộc không gian làm việc này!');
      }

      const projects = await this.projectRepository.find({
        where: { workspace_id: workspaceId },
        order: { created_at: 'DESC' },
      });
      return projects.map((p) => this.mapToResponse(p));
    }

    const userMembers = await this.workspaceMemberRepository.find({
      where: { user_id: userId },
    });
    if (!userMembers || userMembers.length === 0) {
      return [];
    }
    const wsIds = userMembers.map((m) => m.workspace_id);
    const projects = await this.projectRepository.find({
      where: { workspace_id: In(wsIds) },
      order: { created_at: 'DESC' },
    });
    return (projects || []).map((p) => this.mapToResponse(p));
  }

  /**
   * 3. LẤY CHI TIẾT DỰ ÁN THEO ID HOẶC KEY
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
      throw new ForbiddenException('Bạn không có quyền truy cập vào dự án này!');
    }

    return this.mapToResponse(project);
  }

  /**
   * 4. LẤY DANH SÁCH TRẠNG THÁI (STATUSES) CỦA DỰ ÁN
   */
  async findStatusesByProject(userId: string, identifier: string): Promise<Status[]> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    return this.statusRepository.find({
      where: { project_id: project.id },
      order: { position: 'ASC' },
    });
  }

  /**
   * 5. LẤY DANH SÁCH LOẠI CÔNG VIỆC (WORK TYPES) CỦA DỰ ÁN
   */
  async findWorkTypesByProject(userId: string, identifier: string): Promise<WorkType[]> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    return this.workTypeRepository.find({
      where: { project_id: project.id },
      relations: { workflow: true },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * 6. LẤY DANH SÁCH THÀNH VIÊN DỰ ÁN KÈM VAI TRÒ
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
      projectId: m.project_id,
      userId: m.user_id,
      roleId: m.roleId,
      createdAt: m.joined_at,
      updatedAt: m.joined_at,
      user: {
        id: m.user.id,
        email: m.user.email,
        fullName: m.user.full_name,
        avatarUrl: m.user.avatar_url,
      },
      role: {
        id: m.roleEntity?.id || m.roleId,
        name: m.roleEntity?.name || m.role,
      },
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

    let targetUser: User | null = null;
    if (dto.userId) {
      targetUser = await this.userRepository.findOne({ where: { id: dto.userId } });
    } else if (dto.email) {
      targetUser = await this.userRepository.findOne({
        where: { email: dto.email.trim().toLowerCase() },
      });
    }

    if (!targetUser) {
      throw new NotFoundException('Người dùng không tồn tại trong hệ thống!');
    }

    const wsMember = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: targetUser.id },
    });
    if (!wsMember) {
      throw new BadRequestException(
        'Người dùng phải là thành viên của Không gian làm việc trước khi thêm vào Dự án!',
      );
    }

    const existing = await this.projectMemberRepository.findOne({
      where: { project_id: project.id, user_id: targetUser.id },
    });
    if (existing) {
      throw new ConflictException('Người dùng đã là thành viên của dự án này!');
    }

    const role = await this.roleRepository.findOne({
      where: { id: dto.roleId, scope: RoleScope.PROJECT },
    });
    if (!role) {
      throw new BadRequestException('Vai trò không hợp lệ cho cấp độ Dự án!');
    }

    if (role.name === 'OWNER') {
      throw new BadRequestException(
        'Không thể gán vai trò Chủ sở hữu trực tiếp khi thêm thành viên mới!',
      );
    }

    const projectMemberRole = role.name === 'VIEWER' ? ProjectRole.VIEWER : ProjectRole.MEMBER;

    const newMember = this.projectMemberRepository.create({
      project_id: project.id,
      user_id: targetUser.id,
      role: projectMemberRole,
      roleId: role.id,
    });

    const saved = await this.projectMemberRepository.save(newMember);

    return {
      id: saved.id,
      projectId: saved.project_id,
      userId: saved.user_id,
      roleId: saved.roleId,
      createdAt: saved.joined_at,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        fullName: targetUser.full_name,
        avatarUrl: targetUser.avatar_url,
      },
      role: {
        id: role.id,
        name: role.name,
      },
    };
  }

  /**
   * 8. CẬP NHẬT VAI TRÒ THÀNH VIÊN TRONG DỰ ÁN
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
      relations: { user: true },
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
      throw new BadRequestException('Người nhận chuyển giao quyền sở hữu phải là thành viên của dự án!');
    }

    const currentOwnerMember = await this.projectMemberRepository.findOne({
      where: { project_id: project.id, user_id: project.owner_id },
    });

    const ownerRole = await this.roleRepository.findOne({
      where: { name: 'OWNER', scope: RoleScope.PROJECT },
    });
    const memberRole = await this.roleRepository.findOne({
      where: { name: 'MEMBER', scope: RoleScope.PROJECT },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Project, { id: project.id }, { owner_id: dto.targetUserId });

      await queryRunner.manager.update(
        ProjectMember,
        { project_id: project.id, user_id: dto.targetUserId },
        { role: ProjectRole.OWNER, roleId: ownerRole ? ownerRole.id : null },
      );

      if (currentOwnerMember) {
        await queryRunner.manager.update(
          ProjectMember,
          { project_id: project.id, user_id: project.owner_id },
          { role: ProjectRole.MEMBER, roleId: memberRole ? memberRole.id : null },
        );
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Chuyển quyền sở hữu dự án thành công!' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // 11. QUẢN LÝ WORK TYPES
  // ==========================================
  async createWorkType(identifier: string, dto: CreateWorkTypeDto): Promise<WorkType> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    if (dto.workflowId) {
      const wf = await this.workflowRepository.findOne({
        where: { id: dto.workflowId, projectId: project.id },
      });
      if (!wf) {
        throw new BadRequestException('Workflow không tồn tại trong dự án này!');
      }
    }

    const wt = this.workTypeRepository.create({
      project_id: project.id,
      name: dto.name.trim(),
      icon: dto.icon || 'CheckSquare',
      color: dto.color || 'bg-blue-100 text-blue-700',
      isSubtask: dto.isSubtask ?? false,
      workflowId: dto.workflowId || null,
    });

    return this.workTypeRepository.save(wt);
  }

  async updateWorkType(identifier: string, id: string, dto: UpdateWorkTypeDto): Promise<WorkType> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const wt = await this.workTypeRepository.findOne({
      where: { id, project_id: project.id },
    });
    if (!wt) {
      throw new NotFoundException('Loại công việc không tồn tại!');
    }

    if (dto.workflowId) {
      const wf = await this.workflowRepository.findOne({
        where: { id: dto.workflowId, projectId: project.id },
      });
      if (!wf) {
        throw new BadRequestException('Workflow không tồn tại trong dự án này!');
      }
    }

    if (dto.name !== undefined) wt.name = dto.name.trim();
    if (dto.icon !== undefined) wt.icon = dto.icon;
    if (dto.color !== undefined) wt.color = dto.color;
    if (dto.isSubtask !== undefined) wt.isSubtask = dto.isSubtask;
    if (dto.workflowId !== undefined) wt.workflowId = dto.workflowId;

    return this.workTypeRepository.save(wt);
  }

  async deleteWorkType(
    identifier: string,
    id: string,
    dto?: DeleteWorkTypeDto,
  ): Promise<{ success: boolean; message: string }> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const wt = await this.workTypeRepository.findOne({
      where: { id, project_id: project.id },
    });
    if (!wt) {
      throw new NotFoundException('Loại công việc không tồn tại!');
    }

    const taskCount = await this.taskRepository.count({
      where: { project_id: project.id, type_id: id },
    });

    if (taskCount > 0) {
      if (!dto?.fallbackWorkTypeId) {
        throw new BadRequestException(
          `Loại công việc đang có ${taskCount} công việc. Vui lòng cung cấp fallbackWorkTypeId để chuyển đổi trước khi xóa!`,
        );
      }
      if (dto.fallbackWorkTypeId === id) {
        throw new BadRequestException('fallbackWorkTypeId không được trùng với loại công việc đang xóa!');
      }
      const fallback = await this.workTypeRepository.findOne({
        where: { id: dto.fallbackWorkTypeId, project_id: project.id },
      });
      if (!fallback) {
        throw new BadRequestException('fallbackWorkTypeId không tồn tại trong dự án này!');
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.update(
          Task,
          { project_id: project.id, type_id: id },
          { type_id: dto.fallbackWorkTypeId },
        );
        await queryRunner.manager.remove(WorkType, wt);
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } else {
      await this.workTypeRepository.remove(wt);
    }

    return { success: true, message: 'Xóa loại công việc thành công!' };
  }

  // ==========================================
  // 12. QUẢN LÝ STATUSES & WIP LIMIT
  // ==========================================
  async createStatus(identifier: string, dto: CreateStatusDto): Promise<Status> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    if (dto.wipLimit !== undefined && dto.wipLimit !== null && dto.wipLimit < 1) {
      throw new BadRequestException('wipLimit phải lớn hơn hoặc bằng 1!');
    }

    let position = dto.position;
    if (position === undefined) {
      const count = await this.statusRepository.count({ where: { project_id: project.id } });
      position = (count + 1) * 1000;
    }

    const st = this.statusRepository.create({
      project_id: project.id,
      name: dto.name.trim(),
      category: dto.category,
      color: dto.color || '#94a3b8',
      position,
      wipLimit: dto.wipLimit ?? null,
    });

    return this.statusRepository.save(st);
  }

  async updateStatus(identifier: string, id: string, dto: UpdateStatusDto): Promise<Status> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const st = await this.statusRepository.findOne({
      where: { id, project_id: project.id },
    });
    if (!st) {
      throw new NotFoundException('Trạng thái không tồn tại!');
    }

    if (dto.wipLimit !== undefined) {
      if (dto.wipLimit !== null && dto.wipLimit < 1) {
        throw new BadRequestException('wipLimit phải lớn hơn hoặc bằng 1!');
      }
      st.wipLimit = dto.wipLimit;
    }

    if (dto.name !== undefined) st.name = dto.name.trim();
    if (dto.category !== undefined) st.category = dto.category;
    if (dto.color !== undefined) st.color = dto.color;
    if (dto.position !== undefined) st.position = dto.position;

    return this.statusRepository.save(st);
  }

  async deleteStatus(
    identifier: string,
    id: string,
    dto?: DeleteStatusDto,
  ): Promise<{ success: boolean; message: string }> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const st = await this.statusRepository.findOne({
      where: { id, project_id: project.id },
    });
    if (!st) {
      throw new NotFoundException('Trạng thái không tồn tại!');
    }

    const taskCount = await this.taskRepository.count({
      where: { project_id: project.id, status_id: id },
    });

    if (taskCount > 0) {
      if (!dto?.fallbackStatusId) {
        throw new BadRequestException(
          `Trạng thái đang có ${taskCount} công việc. Vui lòng cung cấp fallbackStatusId để chuyển đổi trước khi xóa!`,
        );
      }
      if (dto.fallbackStatusId === id) {
        throw new BadRequestException('fallbackStatusId không được trùng với trạng thái đang xóa!');
      }
      const fallback = await this.statusRepository.findOne({
        where: { id: dto.fallbackStatusId, project_id: project.id },
      });
      if (!fallback) {
        throw new BadRequestException('fallbackStatusId không tồn tại trong dự án này!');
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.update(
          Task,
          { project_id: project.id, status_id: id },
          { status_id: dto.fallbackStatusId },
        );

        // Xóa transitions liên quan đến status này
        await queryRunner.manager.delete(WorkflowTransition, { fromStatusId: id });
        await queryRunner.manager.delete(WorkflowTransition, { toStatusId: id });

        await queryRunner.manager.remove(Status, st);
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } else {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.delete(WorkflowTransition, { fromStatusId: id });
        await queryRunner.manager.delete(WorkflowTransition, { toStatusId: id });
        await queryRunner.manager.remove(Status, st);
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    return { success: true, message: 'Xóa trạng thái thành công!' };
  }

  // ==========================================
  // 13. QUẢN LÝ WORKFLOWS & TRANSITIONS
  // ==========================================
  async getWorkflows(identifier: string): Promise<Workflow[]> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    return this.workflowRepository.find({
      where: { projectId: project.id },
      relations: {
        transitions: {
          fromStatus: true,
          toStatus: true,
        },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async createWorkflow(identifier: string, dto: CreateWorkflowDto): Promise<Workflow> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const wf = this.workflowRepository.create({
      projectId: project.id,
      name: dto.name.trim(),
    });

    return this.workflowRepository.save(wf);
  }

  async updateWorkflow(
    identifier: string,
    workflowId: string,
    dto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const wf = await this.workflowRepository.findOne({
      where: { id: workflowId, projectId: project.id },
    });
    if (!wf) {
      throw new NotFoundException('Quy trình (Workflow) không tồn tại!');
    }

    wf.name = dto.name.trim();
    return this.workflowRepository.save(wf);
  }

  async deleteWorkflow(
    identifier: string,
    workflowId: string,
  ): Promise<{ success: boolean; message: string }> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const wf = await this.workflowRepository.findOne({
      where: { id: workflowId, projectId: project.id },
    });
    if (!wf) {
      throw new NotFoundException('Quy trình (Workflow) không tồn tại!');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        WorkType,
        { project_id: project.id, workflowId },
        { workflowId: null },
      );
      await queryRunner.manager.delete(WorkflowTransition, { workflowId });
      await queryRunner.manager.remove(Workflow, wf);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return { success: true, message: 'Xóa quy trình thành công!' };
  }

  async updateWorkflowTransitions(
    identifier: string,
    workflowId: string,
    dto: UpdateWorkflowTransitionsDto,
  ): Promise<WorkflowTransition[]> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const wf = await this.workflowRepository.findOne({
      where: { id: workflowId, projectId: project.id },
    });
    if (!wf) {
      throw new NotFoundException('Quy trình (Workflow) không tồn tại!');
    }

    // Kiểm tra tất cả fromStatusId và toStatusId thuộc projectId và from !== to
    const projectStatuses = await this.statusRepository.find({
      where: { project_id: project.id },
    });
    const statusMap = new Set(projectStatuses.map((s) => s.id));

    for (const t of dto.transitions) {
      if (t.fromStatusId === t.toStatusId) {
        throw new BadRequestException('fromStatusId và toStatusId không được trùng nhau!');
      }
      if (!statusMap.has(t.fromStatusId) || !statusMap.has(t.toStatusId)) {
        throw new BadRequestException('Trạng thái chuyển đổi không thuộc về dự án này!');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(WorkflowTransition, { workflowId });

      const newTransitions = dto.transitions.map((t) =>
        queryRunner.manager.create(WorkflowTransition, {
          workflowId,
          fromStatusId: t.fromStatusId,
          toStatusId: t.toStatusId,
          conditions: t.conditions || {},
        }),
      );

      await queryRunner.manager.save(WorkflowTransition, newTransitions);
      await queryRunner.commitTransaction();

      return this.workflowTransitionRepository.find({
        where: { workflowId },
        relations: { fromStatus: true, toStatus: true },
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // 14. QUẢN LÝ CUSTOM FIELDS
  // ==========================================
  async getCustomFields(identifier: string): Promise<CustomField[]> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    return this.customFieldRepository.find({
      where: { projectId: project.id },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async createCustomField(identifier: string, dto: CreateCustomFieldDto): Promise<CustomField> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    if (dto.fieldType === CustomFieldType.SELECT) {
      if (!dto.options || !Array.isArray(dto.options) || dto.options.length === 0) {
        throw new BadRequestException(
          'Trường loại SELECT bắt buộc phải có danh sách options không rỗng!',
        );
      }
    }

    let position = dto.position;
    if (position === undefined) {
      const count = await this.customFieldRepository.count({ where: { projectId: project.id } });
      position = count;
    }

    const cf = this.customFieldRepository.create({
      projectId: project.id,
      name: dto.name.trim(),
      fieldType: dto.fieldType,
      options: dto.options || null,
      isRequired: dto.isRequired ?? false,
      position,
    });

    return this.customFieldRepository.save(cf);
  }

  async updateCustomField(
    identifier: string,
    id: string,
    dto: UpdateCustomFieldDto,
  ): Promise<CustomField> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const cf = await this.customFieldRepository.findOne({
      where: { id, projectId: project.id },
    });
    if (!cf) {
      throw new NotFoundException('Trường tùy chỉnh không tồn tại!');
    }

    const targetType = dto.fieldType || cf.fieldType;
    if (targetType === CustomFieldType.SELECT) {
      const targetOptions = dto.options !== undefined ? dto.options : cf.options;
      if (!targetOptions || !Array.isArray(targetOptions) || targetOptions.length === 0) {
        throw new BadRequestException(
          'Trường loại SELECT bắt buộc phải có danh sách options không rỗng!',
        );
      }
    }

    if (dto.name !== undefined) cf.name = dto.name.trim();
    if (dto.fieldType !== undefined) cf.fieldType = dto.fieldType;
    if (dto.options !== undefined) cf.options = dto.options;
    if (dto.isRequired !== undefined) cf.isRequired = dto.isRequired;
    if (dto.position !== undefined) cf.position = dto.position;

    return this.customFieldRepository.save(cf);
  }

  async deleteCustomField(
    identifier: string,
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const project = await this.findProjectEntity(identifier);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const cf = await this.customFieldRepository.findOne({
      where: { id, projectId: project.id },
    });
    if (!cf) {
      throw new NotFoundException('Trường tùy chỉnh không tồn tại!');
    }

    await this.customFieldRepository.remove(cf);
    return { success: true, message: 'Xóa trường tùy chỉnh thành công!' };
  }

  // ==========================================
  // 15. CẬP NHẬT CẤU HÌNH VÀ METHODOLOGY DỰ ÁN
  // ==========================================
  async updateSettings(
    userId: string,
    idOrKey: string,
    dto: UpdateProjectSettingsDto | Record<string, any>,
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

    if (dto.name !== undefined) project.name = dto.name.trim();
    if (dto.description !== undefined) {
      project.description = dto.description ? dto.description.trim() : null;
    }
    if (dto.startDate !== undefined) {
      project.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      project.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.methodology !== undefined) {
      project.methodology = dto.methodology as ProjectMethodology;
    }

    // Merge nested settings or root settings
    const additionalSettings = dto.settings !== undefined ? dto.settings : dto;
    const cleanSettings: Record<string, any> = {};
    for (const [k, v] of Object.entries(additionalSettings)) {
      if (!['name', 'description', 'startDate', 'endDate', 'methodology', 'settings'].includes(k)) {
        cleanSettings[k] = v;
      }
    }

    project.settings = {
      ...project.settings,
      ...cleanSettings,
    };

    const saved = await this.projectRepository.save(project);
    return this.mapToResponse(saved);
  }

  /**
   * 16. XÓA MỀM DỰ ÁN (THEO ID HOẶC KEY)
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

  private mapToResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      key: project.key,
      color: project.color,
      description: project.description,
      settings: project.settings || {},
      methodology: project.methodology,
      startDate: project.startDate,
      endDate: project.endDate,
      workspaceId: project.workspace_id,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }
}
