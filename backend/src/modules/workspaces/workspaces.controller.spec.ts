import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { WorkspaceRole } from './enums/workspace-role.enum.js';
import { WorkspaceResponseDto } from './dto/workspace-response.dto.js';

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
    }).compile();

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
});
