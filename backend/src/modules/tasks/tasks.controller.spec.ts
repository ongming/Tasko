import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/task.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';

describe('TasksController - Unit Tests', () => {
  let controller: TasksController;
  let service: Partial<TasksService>;

  const mockUserId = 'user-uuid-123';
  const mockProjectId = 'proj-uuid-456';
  const mockTaskId = 'task-uuid-789';

  beforeEach(async () => {
    service = {
      getTasks: vi.fn(),
      createTask: vi.fn(),
      getTaskById: vi.fn(),
      updateTask: vi.fn(),
      moveTask: vi.fn(),
      deleteTask: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('nên khởi tạo thành công controller', () => {
    expect(controller).toBeDefined();
  });

  it('gọi tasksService.getTasks với projectId và query', async () => {
    vi.mocked(service.getTasks!).mockResolvedValue([]);
    const res = await controller.getTasks(mockProjectId, 'sprint-1', 'false');
    expect(service.getTasks).toHaveBeenCalledWith(mockProjectId, { sprintId: 'sprint-1', isBacklog: 'false' });
    expect(res).toEqual([]);
  });

  it('gọi tasksService.createTask với userId, projectId và DTO', async () => {
    const dto: CreateTaskDto = { title: 'Làm việc mới' };
    const mockCreated = { id: mockTaskId, title: 'Làm việc mới' } as any;
    vi.mocked(service.createTask!).mockResolvedValue(mockCreated);

    const res = await controller.createTask(mockUserId, mockProjectId, dto);
    expect(service.createTask).toHaveBeenCalledWith(mockUserId, mockProjectId, dto);
    expect(res).toEqual(mockCreated);
  });

  it('gọi tasksService.getTaskById với taskId', async () => {
    const mockTask = { id: mockTaskId, title: 'Task 1' } as any;
    vi.mocked(service.getTaskById!).mockResolvedValue(mockTask);

    const res = await controller.getTaskById(mockTaskId);
    expect(service.getTaskById).toHaveBeenCalledWith(mockTaskId);
    expect(res).toEqual(mockTask);
  });

  it('gọi tasksService.deleteTask', async () => {
    vi.mocked(service.deleteTask!).mockResolvedValue({ success: true } as any);
    const res = await controller.deleteTask(mockUserId, mockTaskId);
    expect(service.deleteTask).toHaveBeenCalledWith(mockUserId, mockTaskId);
    expect(res).toEqual({ success: true });
  });
});
