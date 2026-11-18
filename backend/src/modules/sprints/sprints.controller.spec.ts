import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SprintsController } from './sprints.controller.js';
import { SprintsService } from './sprints.service.js';
import { CreateSprintDto } from './dto/sprint.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';

describe('SprintsController - Unit Tests', () => {
  let controller: SprintsController;
  let service: Partial<SprintsService>;

  const mockUserId = 'user-uuid-123';
  const mockProjectId = 'proj-uuid-456';
  const mockSprintId = 'sprint-uuid-789';

  beforeEach(async () => {
    service = {
      getSprints: vi.fn(),
      createSprint: vi.fn(),
      updateSprint: vi.fn(),
      startSprint: vi.fn(),
      completeSprint: vi.fn(),
      deleteSprint: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SprintsController],
      providers: [{ provide: SprintsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SprintsController>(SprintsController);
  });

  it('nên khởi tạo thành công controller', () => {
    expect(controller).toBeDefined();
  });

  it('gọi sprintsService.getSprints với projectId', async () => {
    vi.mocked(service.getSprints!).mockResolvedValue([]);
    const res = await controller.getSprints(mockProjectId);
    expect(service.getSprints).toHaveBeenCalledWith(mockProjectId);
    expect(res).toEqual([]);
  });

  it('gọi sprintsService.createSprint với userId, projectId và DTO', async () => {
    const dto: CreateSprintDto = { name: 'Sprint 1' };
    const mockCreated = { id: mockSprintId, name: 'Sprint 1' } as any;
    vi.mocked(service.createSprint!).mockResolvedValue(mockCreated);

    const res = await controller.createSprint(mockUserId, mockProjectId, dto);
    expect(service.createSprint).toHaveBeenCalledWith(mockUserId, mockProjectId, dto);
    expect(res).toEqual(mockCreated);
  });

  it('gọi sprintsService.deleteSprint', async () => {
    vi.mocked(service.deleteSprint!).mockResolvedValue({ success: true } as any);
    const res = await controller.deleteSprint(mockUserId, mockSprintId);
    expect(service.deleteSprint).toHaveBeenCalledWith(mockUserId, mockSprintId);
    expect(res).toEqual({ success: true });
  });
});
