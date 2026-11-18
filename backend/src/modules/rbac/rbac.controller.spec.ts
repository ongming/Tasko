import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RbacController } from './rbac.controller.js';
import { Role, RoleScope } from './entities/role.entity.js';

describe('RbacController - Unit Tests', () => {
  let controller: RbacController;
  let roleRepo: any;

  beforeEach(async () => {
    roleRepo = {
      find: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RbacController],
      providers: [
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepo,
        },
      ],
    }).compile();

    controller = module.get<RbacController>(RbacController);
  });

  it('nên khởi tạo thành công controller', () => {
    expect(controller).toBeDefined();
  });

  it('lấy danh sách roles lọc theo scope PROJECT', async () => {
    vi.mocked(roleRepo.find).mockResolvedValue([
      { id: '1', name: 'OWNER', scope: RoleScope.PROJECT },
      { id: '2', name: 'MEMBER', scope: RoleScope.PROJECT },
    ]);

    const res = await controller.getRoles(RoleScope.PROJECT);
    expect(roleRepo.find).toHaveBeenCalledWith({ where: { scope: RoleScope.PROJECT } });
    expect(res).toHaveLength(2);
  });
});
