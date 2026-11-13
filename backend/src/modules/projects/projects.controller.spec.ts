import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';

describe('ProjectsController - Unit Tests', () => {
  let controller: ProjectsController;
  let service: Partial<ProjectsService>;

  const mockUserId = 'user-uuid-123';
  const mockWorkspaceId = 'ws-uuid-456';

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAllByWorkspace: vi.fn(),
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: service }],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('nên khởi tạo thành công controller', () => {
    expect(controller).toBeDefined();
  });

  it('gọi projectsService.create với đúng userId và DTO', async () => {
    const dto: CreateProjectDto = {
      name: 'Tasko Backend',
      key: 'TSK',
      workspaceId: mockWorkspaceId,
      color: 'bg-indigo-600',
    };
    const mockCreated = {
      id: 'proj-1',
      name: 'Tasko Backend',
      key: 'TSK',
      color: 'bg-indigo-600',
      description: null,
      workspaceId: mockWorkspaceId,
      ownerId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(service.create!).mockResolvedValue(mockCreated);

    const result = await controller.create(mockUserId, dto);
    expect(service.create).toHaveBeenCalledWith(mockUserId, dto);
    expect(result).toEqual(mockCreated);
  });

  it('gọi projectsService.findAllByWorkspace với workspaceId', async () => {
    vi.mocked(service.findAllByWorkspace!).mockResolvedValue([]);

    await controller.findAll(mockUserId, mockWorkspaceId);
    expect(service.findAllByWorkspace).toHaveBeenCalledWith(mockUserId, mockWorkspaceId);
  });

  it('gọi projectsService.findById với id dự án', async () => {
    const mockDetail = {
      id: 'p-123',
      name: 'Proj',
      key: 'P',
      color: 'bg-blue-500',
      description: null,
      workspaceId: mockWorkspaceId,
      ownerId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(service.findById!).mockResolvedValue(mockDetail);

    const result = await controller.findOne(mockUserId, 'p-123');
    expect(service.findById).toHaveBeenCalledWith(mockUserId, 'p-123');
    expect(result).toEqual(mockDetail);
  });
});
