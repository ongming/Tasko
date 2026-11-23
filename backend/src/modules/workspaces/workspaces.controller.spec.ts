import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { WorkspaceRole } from './enums/workspace-role.enum.js';
import { WorkspaceResponseDto } from './dto/workspace-response.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';

describe('WorkspacesController - Create Workspace', () => {
  let controller: WorkspacesController;
  let service: WorkspacesService;

  const mockResponse: WorkspaceResponseDto = {
    id: 'ws-mock-id',
    name: 'Tasko Dev Team',
    slug: 'tasko-dev-team',
    description: 'Workspace for dev team',
    role: WorkspaceRole.OWNER,
    ownerId: 'user-123',
    memberCount: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockWorkspacesService = {
    create: vi.fn().mockResolvedValue(mockResponse),
    findAllByUser: vi.fn(),
    findBySlug: vi.fn(),
    update: vi.fn().mockResolvedValue(mockResponse),
    remove: vi.fn().mockResolvedValue({
      success: true,
      message: 'Đã xóa không gian làm việc thành công',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: mockWorkspacesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('nên khởi tạo thành công controller', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('nên gọi workspacesService.create với đúng userId và DTO', async () => {
      const userId = 'user-123';
      const dto: CreateWorkspaceDto = {
        name: 'Tasko Dev Team',
        slug: 'tasko-dev-team',
        description: 'Workspace for dev team',
      };

      const result = await controller.create(userId, dto);

      expect(service.create).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update()', () => {
    it('nên gọi workspacesService.update với đúng wsId, userId và DTO', async () => {
      const wsId = 'ws-mock-id';
      const userId = 'user-123';
      const dto = { name: 'Updated Name', description: 'Updated Desc' };

      const result = await controller.update(userId, wsId, dto);

      expect(service.update).toHaveBeenCalledWith(wsId, userId, dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('remove()', () => {
    it('nên gọi workspacesService.remove với đúng wsId và userId', async () => {
      const wsId = 'ws-mock-id';
      const userId = 'user-123';

      const result = await controller.remove(wsId, userId);

      expect(service.remove).toHaveBeenCalledWith(wsId, userId);
      expect(result).toEqual({
        success: true,
        message: 'Đã xóa không gian làm việc thành công',
      });
    });

    it('nên truyền tiếp lỗi NotFoundException từ service khi Workspace không tồn tại', async () => {
      const notFoundError = new Error('Không tìm thấy Workspace');
      vi.mocked(service.remove).mockRejectedValueOnce(notFoundError);

      await expect(controller.remove('missing-ws', 'user-123')).rejects.toThrow(
        'Không tìm thấy Workspace',
      );
    });

    it('nên truyền tiếp lỗi ForbiddenException từ service khi không phải Chủ sở hữu', async () => {
      const forbiddenError = new Error(
        'Chỉ chủ sở hữu Workspace mới có quyền xóa không gian làm việc này',
      );
      vi.mocked(service.remove).mockRejectedValueOnce(forbiddenError);

      await expect(controller.remove('ws-mock-id', 'other-user')).rejects.toThrow(
        'Chỉ chủ sở hữu Workspace mới có quyền xóa không gian làm việc này',
      );
    });
  });
});
