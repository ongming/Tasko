import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity.js';
import { WorkspaceMember } from './entities/workspace-member.entity.js';
import { User } from '../auth/entities/user.entity.js';
import { Role, RoleScope } from '../rbac/entities/role.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { WorkspaceRole } from './enums/workspace-role.enum.js';
import { WorkspaceResponseDto } from './dto/workspace-response.dto.js';
import {
  AddWorkspaceMemberDto,
  UpdateWorkspaceMemberRoleDto,
} from './dto/workspace-member.dto.js';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  /**
   * Tạo Workspace mới trong Transaction nguyên tử
   */
  async create(userId: string, dto: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    const slug = dto.slug.toLowerCase().trim();

    // 1. Kiểm tra tính duy nhất của slug
    const existing = await this.workspaceRepo.findOne({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(
        `Đường dẫn định danh (slug) "${slug}" đã tồn tại. Vui lòng chọn slug khác.`,
      );
    }

    // 2. Chạy Database Transaction đảm bảo tạo Workspace và gán quyền OWNER cho Creator
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2.1. Lưu bản ghi Workspace
      const workspace = queryRunner.manager.create(Workspace, {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        owner_id: userId,
      });
      const savedWorkspace = await queryRunner.manager.save(workspace);

      // 2.2. Gán Creator làm OWNER trong workspace_members kèm roleId (ADMIN cấp WORKSPACE)
      const adminRole = await queryRunner.manager.findOne(Role, {
        where: { name: 'ADMIN', scope: RoleScope.WORKSPACE },
      });

      const member = queryRunner.manager.create(WorkspaceMember, {
        workspace_id: savedWorkspace.id,
        user_id: userId,
        role: WorkspaceRole.OWNER,
        roleId: adminRole ? adminRole.id : null,
      });
      await queryRunner.manager.save(member);

      await queryRunner.commitTransaction();

      return {
        id: savedWorkspace.id,
        name: savedWorkspace.name,
        slug: savedWorkspace.slug,
        description: savedWorkspace.description,
        role: WorkspaceRole.OWNER,
        ownerId: savedWorkspace.owner_id,
        memberCount: 1,
        createdAt: savedWorkspace.created_at,
        updatedAt: savedWorkspace.updated_at,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy danh sách tất cả các Workspace mà User là thành viên
   */
  async findAllByUser(userId: string): Promise<WorkspaceResponseDto[]> {
    const memberships = await this.memberRepo.find({
      where: { user_id: userId },
      relations: { workspace: true },
      order: { joined_at: 'DESC' },
    });

    const countMap = new Map<string, number>();
    const wsIds = memberships.map((m) => m.workspace.id);
    if (wsIds.length > 0 && typeof this.memberRepo.createQueryBuilder === 'function') {
      const rows = await this.memberRepo
        .createQueryBuilder('wm')
        .select('wm.workspace_id', 'workspaceId')
        .addSelect('COUNT(*)', 'cnt')
        .where('wm.workspace_id IN (:...wsIds)', { wsIds })
        .groupBy('wm.workspace_id')
        .getRawMany<{ workspaceId: string; cnt: string }>();
      for (const r of rows) {
        countMap.set(r.workspaceId, Number(r.cnt) || 1);
      }
    }

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      description: m.workspace.description,
      role: m.role,
      ownerId: m.workspace.owner_id,
      memberCount: countMap.get(m.workspace.id) ?? 1,
      createdAt: m.workspace.created_at,
      updatedAt: m.workspace.updated_at,
    }));
  }

  /**
   * Lấy chi tiết Workspace theo slug và kiểm tra quyền truy cập
   */
  async findBySlug(userId: string, slug: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceRepo.findOne({
      where: { slug: slug.toLowerCase().trim() },
    });

    if (!workspace) {
      throw new NotFoundException(`Không tìm thấy không gian làm việc với slug "${slug}"`);
    }

    const membership = await this.memberRepo.findOne({
      where: { workspace_id: workspace.id, user_id: userId },
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền truy cập vào không gian làm việc này');
    }

    const memberCount = await this.memberRepo.count({
      where: { workspace_id: workspace.id },
    });

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      role: membership.role,
      ownerId: workspace.owner_id,
      memberCount,
      createdAt: workspace.created_at,
      updatedAt: workspace.updated_at,
    };
  }

  /**
   * Cập nhật thông tin Workspace (Tên, Mô tả)
   */
  async update(wsId: string, userId: string, dto: UpdateWorkspaceDto): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: wsId },
    });
    if (!workspace) {
      throw new NotFoundException('Không tìm thấy không gian làm việc!');
    }

    const membership = await this.memberRepo.findOne({
      where: { workspace_id: wsId, user_id: userId },
      relations: { roleEntity: true },
    });
    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền truy cập không gian làm việc này!');
    }
    const canManage =
      membership.role === WorkspaceRole.OWNER ||
      membership.role === WorkspaceRole.ADMIN ||
      membership.roleEntity?.name === 'ADMIN';

    if (!canManage) {
      throw new ForbiddenException('Chỉ Quản trị viên hoặc Chủ sở hữu mới được cập nhật không gian làm việc!');
    }

    if (dto.name !== undefined) {
      workspace.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      workspace.description = dto.description.trim() || null;
    }

    const saved = await this.workspaceRepo.save(workspace);
    const memberCount = await this.memberRepo.count({
      where: { workspace_id: wsId },
    });

    return {
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      description: saved.description,
      role: membership.role,
      ownerId: saved.owner_id,
      memberCount,
      createdAt: saved.created_at,
      updatedAt: saved.updated_at,
    };
  }

  /**
   * Lấy danh sách thành viên của Workspace
   */
  async getMembers(wsId: string) {
    const members = await this.memberRepo.find({
      where: { workspace_id: wsId },
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
   * Thêm thành viên mới vào Workspace
   */
  async addMember(wsId: string, dto: AddWorkspaceMemberDto) {
    const role = await this.roleRepo.findOne({
      where: { id: dto.roleId, scope: RoleScope.WORKSPACE },
    });
    if (!role) {
      throw new BadRequestException('Vai trò không hợp lệ cho Không gian làm việc!');
    }

    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này!');
    }

    const existing = await this.memberRepo.findOne({
      where: { workspace_id: wsId, user_id: user.id },
    });
    if (existing) {
      throw new ConflictException('Người dùng đã là thành viên của không gian làm việc!');
    }

    const memberRoleEnum =
      role.name === 'ADMIN' ? WorkspaceRole.ADMIN : WorkspaceRole.MEMBER;

    const newMember = this.memberRepo.create({
      workspace_id: wsId,
      user_id: user.id,
      roleId: role.id,
      role: memberRoleEnum,
    });
    const saved = await this.memberRepo.save(newMember);

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
   * Đổi vai trò của thành viên trong Workspace
   */
  async updateMemberRole(
    wsId: string,
    targetUserId: string,
    dto: UpdateWorkspaceMemberRoleDto,
  ) {
    const member = await this.memberRepo.findOne({
      where: { workspace_id: wsId, user_id: targetUserId },
      relations: { roleEntity: true },
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong không gian làm việc!');
    }

    const newRole = await this.roleRepo.findOne({
      where: { id: dto.roleId, scope: RoleScope.WORKSPACE },
    });
    if (!newRole) {
      throw new BadRequestException('Vai trò mới không hợp lệ cho Không gian làm việc!');
    }

    const isCurrentAdmin =
      member.roleEntity?.name === 'ADMIN' ||
      member.role === WorkspaceRole.ADMIN ||
      member.role === WorkspaceRole.OWNER;

    if (isCurrentAdmin && newRole.name !== 'ADMIN') {
      const allMembers = await this.memberRepo.find({
        where: { workspace_id: wsId },
        relations: { roleEntity: true },
      });
      const adminCount = allMembers.filter(
        (m) =>
          m.roleEntity?.name === 'ADMIN' ||
          m.role === WorkspaceRole.ADMIN ||
          m.role === WorkspaceRole.OWNER,
      ).length;

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Không thể hạ vai trò Quản trị viên duy nhất của Không gian làm việc!',
        );
      }
    }

    member.roleId = newRole.id;
    member.role =
      newRole.name === 'ADMIN' ? WorkspaceRole.ADMIN : WorkspaceRole.MEMBER;
    await this.memberRepo.save(member);

    return {
      id: member.id,
      userId: member.user_id,
      roleId: newRole.id,
      role: { id: newRole.id, name: newRole.name },
    };
  }

  /**
   * Xóa thành viên khỏi Workspace
   */
  async removeMember(wsId: string, targetUserId: string) {
    const member = await this.memberRepo.findOne({
      where: { workspace_id: wsId, user_id: targetUserId },
      relations: { roleEntity: true },
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong không gian làm việc!');
    }

    const isCurrentAdmin =
      member.roleEntity?.name === 'ADMIN' ||
      member.role === WorkspaceRole.ADMIN ||
      member.role === WorkspaceRole.OWNER;

    if (isCurrentAdmin) {
      const allMembers = await this.memberRepo.find({
        where: { workspace_id: wsId },
        relations: { roleEntity: true },
      });
      const adminCount = allMembers.filter(
        (m) =>
          m.roleEntity?.name === 'ADMIN' ||
          m.role === WorkspaceRole.ADMIN ||
          m.role === WorkspaceRole.OWNER,
      ).length;

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Không thể xóa Quản trị viên duy nhất của Không gian làm việc!',
        );
      }
    }

    await this.memberRepo.remove(member);
    return { success: true, message: 'Đã xóa thành viên khỏi không gian làm việc thành công!' };
  }

  /**
   * Xóa vĩnh viễn Workspace cùng toàn bộ dữ liệu phụ thuộc trong Transaction nguyên tử
   * Chỉ chủ sở hữu (owner_id) mới có quyền thực hiện
   */
  async remove(
    wsId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: wsId },
    });
    if (!workspace) {
      throw new NotFoundException('Không tìm thấy Workspace');
    }

    if (workspace.owner_id !== userId) {
      throw new ForbiddenException(
        'Chỉ chủ sở hữu Workspace mới có quyền xóa không gian làm việc này',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      // Lấy tất cả dự án thuộc Workspace (bao gồm cả soft-deleted) để xóa theo đúng thứ tự FK
      const projects = await manager.find(Project, {
        where: { workspace_id: wsId },
        select: { id: true },
        withDeleted: true,
      });
      const projectIds = projects.map((p) => p.id);

      if (projectIds.length > 0) {
        // Xóa tasks trước để tránh lỗi 23503 do tasks.status_id có ON DELETE RESTRICT
        await manager.delete(Task, { project_id: In(projectIds) });
        // Xóa toàn bộ projects (cascade project_members, statuses, work_types, workflows, sprints, custom_fields)
        await manager.delete(Project, { workspace_id: wsId });
      }

      // Xóa toàn bộ thành viên Workspace
      await manager.delete(WorkspaceMember, { workspace_id: wsId });

      // Xóa bản ghi Workspace
      await manager.delete(Workspace, { id: wsId });
    });

    return {
      success: true,
      message: 'Đã xóa không gian làm việc thành công',
    };
  }
}
