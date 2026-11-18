import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RbacSeederService } from './rbac-seeder.service.js';
import { Role, RoleScope } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { RolePermission } from './entities/role-permission.entity.js';

describe('RbacSeederService - Unit Tests', () => {
  let service: RbacSeederService;
  let roleRepo: Partial<Repository<Role>>;
  let permissionRepo: Partial<Repository<Permission>>;
  let rolePermissionRepo: Partial<Repository<RolePermission>>;

  beforeEach(async () => {
    roleRepo = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((data: any) => ({ ...data, id: 'role-uuid' })),
      save: vi.fn(async (entity: any) => ({ ...entity, id: 'role-uuid' })),
    };

    permissionRepo = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((data: any) => ({ ...data, id: 'perm-uuid' })),
      save: vi.fn(async (entity: any) => ({ ...entity, id: 'perm-uuid' })),
    };

    rolePermissionRepo = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((data: any) => data),
      save: vi.fn(async (entity: any) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacSeederService,
        { provide: getRepositoryToken(Role), useValue: roleRepo },
        { provide: getRepositoryToken(Permission), useValue: permissionRepo },
        { provide: getRepositoryToken(RolePermission), useValue: rolePermissionRepo },
      ],
    }).compile();

    service = module.get<RbacSeederService>(RbacSeederService);
  });

  it('seed tạo đủ 9 permissions khi DB rỗng', async () => {
    await service.seed();
    expect(permissionRepo.save).toHaveBeenCalledTimes(9);
  });

  it('seed tạo đủ 5 roles khi DB rỗng', async () => {
    await service.seed();
    expect(roleRepo.save).toHaveBeenCalledTimes(5);
  });

  it('seed idempotent - không tạo lại permission đã tồn tại', async () => {
    vi.mocked(permissionRepo.findOne!).mockResolvedValue({ id: 'perm-uuid', code: 'WORKSPACE_ADMIN' } as Permission);
    vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: 'role-uuid', name: 'ADMIN', scope: RoleScope.WORKSPACE } as Role);
    vi.mocked(rolePermissionRepo.findOne!).mockResolvedValue({ role_id: 'role-uuid', permission_id: 'perm-uuid' } as RolePermission);

    await service.seed();
    expect(permissionRepo.save).not.toHaveBeenCalled();
    expect(roleRepo.save).not.toHaveBeenCalled();
    expect(rolePermissionRepo.save).not.toHaveBeenCalled();
  });

  it('seed tạo role-permission mapping đúng số lượng', async () => {
    await service.seed();
    // WORKSPACE/ADMIN: 9, WORKSPACE/MEMBER: 1, PROJECT/OWNER: 6, PROJECT/MEMBER: 3, PROJECT/VIEWER: 1 => Tổng 20
    expect(rolePermissionRepo.save).toHaveBeenCalledTimes(20);
  });
});
