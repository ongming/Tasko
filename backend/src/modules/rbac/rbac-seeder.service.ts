import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleScope } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { RolePermission } from './entities/role-permission.entity.js';

interface PermissionSeed {
  code: string;
  description: string;
}

interface RoleSeed {
  name: string;
  scope: RoleScope;
  description: string;
  permissions: string[];
}

@Injectable()
export class RbacSeederService implements OnModuleInit {
  private readonly logger = new Logger(RbacSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    this.logger.log('Bắt đầu kiểm tra và seed dữ liệu RBAC...');

    const permissionSeeds: PermissionSeed[] = [
      { code: 'WORKSPACE_ADMIN', description: 'Toàn quyền quản trị workspace' },
      { code: 'WORKSPACE_MEMBER_MANAGE', description: 'Quản lý thành viên workspace' },
      { code: 'WORKSPACE_PROJECT_VIEW', description: 'Xem danh sách dự án trong workspace' },
      { code: 'PROJECT_CONFIGURE', description: 'Cấu hình dự án (workflow, settings)' },
      { code: 'PROJECT_MANAGE', description: 'Quản lý thành viên dự án' },
      { code: 'SPRINT_MANAGE', description: 'Tạo, bắt đầu và hoàn thành Sprint' },
      { code: 'TASK_WRITE', description: 'Tạo và chỉnh sửa Task' },
      { code: 'COLLAB_AND_AI_USE', description: 'Sử dụng tính năng cộng tác và AI' },
      { code: 'PROJECT_VIEW_ONLY', description: 'Chỉ xem dự án' },
    ];

    const roleSeeds: RoleSeed[] = [
      {
        name: 'ADMIN',
        scope: RoleScope.WORKSPACE,
        description: 'Quản trị viên workspace, toàn quyền',
        permissions: [
          'WORKSPACE_ADMIN',
          'WORKSPACE_MEMBER_MANAGE',
          'WORKSPACE_PROJECT_VIEW',
          'PROJECT_CONFIGURE',
          'PROJECT_MANAGE',
          'SPRINT_MANAGE',
          'TASK_WRITE',
          'COLLAB_AND_AI_USE',
          'PROJECT_VIEW_ONLY',
        ],
      },
      {
        name: 'MEMBER',
        scope: RoleScope.WORKSPACE,
        description: 'Thành viên workspace thông thường',
        permissions: ['WORKSPACE_PROJECT_VIEW'],
      },
      {
        name: 'OWNER',
        scope: RoleScope.PROJECT,
        description: 'Chủ sở hữu dự án',
        permissions: [
          'PROJECT_CONFIGURE',
          'PROJECT_MANAGE',
          'SPRINT_MANAGE',
          'TASK_WRITE',
          'COLLAB_AND_AI_USE',
          'PROJECT_VIEW_ONLY',
        ],
      },
      {
        name: 'MEMBER',
        scope: RoleScope.PROJECT,
        description: 'Thành viên dự án',
        permissions: ['TASK_WRITE', 'COLLAB_AND_AI_USE', 'PROJECT_VIEW_ONLY'],
      },
      {
        name: 'VIEWER',
        scope: RoleScope.PROJECT,
        description: 'Người xem dự án (chỉ đọc)',
        permissions: ['PROJECT_VIEW_ONLY'],
      },
    ];

    // 1. Seed Permissions (idempotent)
    const permissionMap = new Map<string, Permission>();
    for (const seed of permissionSeeds) {
      let perm = await this.permissionRepository.findOne({ where: { code: seed.code } });
      if (!perm) {
        perm = this.permissionRepository.create({ code: seed.code, description: seed.description });
        perm = await this.permissionRepository.save(perm);
        this.logger.log(`Đã tạo permission: ${seed.code}`);
      }
      permissionMap.set(seed.code, perm);
    }

    // 2. Seed Roles & RolePermissions (idempotent)
    for (const roleSeed of roleSeeds) {
      let role = await this.roleRepository.findOne({
        where: { name: roleSeed.name, scope: roleSeed.scope },
      });
      if (!role) {
        role = this.roleRepository.create({
          name: roleSeed.name,
          scope: roleSeed.scope,
          description: roleSeed.description,
        });
        role = await this.roleRepository.save(role);
        this.logger.log(`Đã tạo role: ${roleSeed.name} (${roleSeed.scope})`);
      }

      for (const permCode of roleSeed.permissions) {
        const perm = permissionMap.get(permCode);
        if (!perm) continue;

        const existing = await this.rolePermissionRepository.findOne({
          where: { role_id: role.id, permission_id: perm.id },
        });
        if (!existing) {
          const rp = this.rolePermissionRepository.create({
            role_id: role.id,
            permission_id: perm.id,
          });
          await this.rolePermissionRepository.save(rp);
        }
      }
    }

    this.logger.log('Seed dữ liệu RBAC hoàn tất!');
  }
}
