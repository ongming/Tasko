import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { TasksService } from './tasks.service.js';
import { Task, TaskPriority } from './entities/task.entity.js';
import { Status } from '../projects/entities/status.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { Project } from '../projects/entities/project.entity.js';

describe('TasksService - Unit Tests', () => {
  let service: TasksService;
  let taskRepo: Partial<Repository<Task>>;
  let statusRepo: Partial<Repository<Status>>;
  let workTypeRepo: Partial<Repository<WorkType>>;
  let projectRepo: Partial<Repository<Project>>;

  const mockProjectId = 'project-uuid-111';
  const mockTaskId = 'task-uuid-333';

  const mockQueryBuilder = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    taskRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: mockTaskId })),
      save: vi.fn(async (entity: any) => ({ ...entity, id: entity.id || mockTaskId })),
      count: vi.fn(),
      remove: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    statusRepo = {
      findOne: vi.fn(),
    };

    workTypeRepo = {
      findOne: vi.fn(),
    };

    projectRepo = {
      findOne: vi.fn().mockResolvedValue({ id: mockProjectId, key: 'PROJ' } as Project),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(Status), useValue: statusRepo },
        { provide: getRepositoryToken(WorkType), useValue: workTypeRepo },
        { provide: getRepositoryToken(Project), useValue: projectRepo },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('createTask', () => {
    it('tạo task thành công với status mặc định', async () => {
      vi.mocked(taskRepo.count!).mockResolvedValue(0);
      vi.mocked(statusRepo.findOne!).mockResolvedValue({ id: 'status-1', name: 'Backlog', is_default: true } as Status);
      vi.mocked(workTypeRepo.findOne!).mockResolvedValue(null);
      vi.mocked(taskRepo.create!).mockReturnValue({
        id: mockTaskId,
        project_id: mockProjectId,
        task_key: 'PROJ-1',
        title: 'Task mới',
        priority: TaskPriority.MEDIUM,
        status_id: 'status-1',
      } as Task);
      vi.mocked(taskRepo.save!).mockResolvedValue({ id: mockTaskId } as Task);
      vi.mocked(taskRepo.findOne!).mockResolvedValue({
        id: mockTaskId,
        project_id: mockProjectId,
        task_key: 'PROJ-1',
        title: 'Task mới',
        status: { id: 'status-1', name: 'Backlog', category: 'TODO', color: '#ccc' },
        type: null,
        assignee: null,
        reporter: null,
        priority: TaskPriority.MEDIUM,
        position: 1000,
      } as any);

      const result = await service.createTask('user-1', mockProjectId, { title: 'Task mới' });
      expect(result.taskKey).toBe('PROJ-1');
    });

    it('ném NotFoundException khi không tìm thấy project', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue(null);
      await expect(service.createTask('user-1', 'non-existent', { title: 'Task mới' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTasks', () => {
    it('lấy danh sách tasks thành công', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([
        {
          id: mockTaskId,
          project_id: mockProjectId,
          sprint_id: null,
          task_key: 'PROJ-1',
          title: 'Task 1',
          status: { id: 's1', name: 'Todo', category: 'TODO', color: '#ccc' },
          type: null,
          assignee: null,
          position: 1000,
        },
      ]);

      const result = await service.getTasks(mockProjectId);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Task 1');
    });
  });

  describe('getTaskById', () => {
    it('lấy task thành công theo ID', async () => {
      vi.mocked(taskRepo.findOne!).mockResolvedValue({
        id: mockTaskId,
        project_id: mockProjectId,
        task_key: 'PROJ-1',
        title: 'Task mới',
        status: { id: 'status-1', name: 'Backlog', category: 'TODO', color: '#ccc' },
        type: null,
        assignee: null,
        reporter: null,
        priority: TaskPriority.MEDIUM,
        position: 1000,
      } as any);

      const result = await service.getTaskById(mockTaskId);
      expect(result.id).toBe(mockTaskId);
      expect(result.title).toBe('Task mới');
    });

    it('ném NotFoundException khi không tìm thấy task', async () => {
      vi.mocked(taskRepo.findOne!).mockResolvedValue(null);
      await expect(service.getTaskById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTask', () => {
    it('cập nhật task thành công', async () => {
      const mockTask = {
        id: mockTaskId,
        title: 'Old title',
        description: null,
        status_id: 'status-1',
        priority: TaskPriority.LOW,
      } as Task;
      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(taskRepo.save!).mockResolvedValue({ ...mockTask, title: 'New title' } as Task);
      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce({
        ...mockTask,
        title: 'New title',
        status: null,
        type: null,
        assignee: null,
        reporter: null,
      } as any);

      const result = await service.updateTask('user-1', mockTaskId, { title: 'New title' });
      expect(result.title).toBe('New title');
    });

    it('ném NotFoundException khi task không tồn tại', async () => {
      vi.mocked(taskRepo.findOne!).mockResolvedValue(null);
      await expect(service.updateTask('user-1', 'non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('moveTask', () => {
    it('di chuyển task thành công', async () => {
      const mockTask = {
        id: mockTaskId,
        sprint_id: null,
        status_id: 'status-1',
        position: 1000,
      } as Task;
      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(taskRepo.save!).mockResolvedValue({ ...mockTask, position: 2000 } as Task);
      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce({
        ...mockTask,
        position: 2000,
        status: null,
        type: null,
        assignee: null,
        reporter: null,
      } as any);

      const result = await service.moveTask('user-1', mockTaskId, { position: 2000 });
      expect(result.position).toBe(2000);
    });
  });

  describe('deleteTask', () => {
    it('xóa task thành công', async () => {
      const mockTask = { id: mockTaskId } as Task;
      vi.mocked(taskRepo.findOne!).mockResolvedValue(mockTask);
      vi.mocked(taskRepo.remove!).mockResolvedValue(mockTask);

      const result = await service.deleteTask('user-1', mockTaskId);
      expect(result).toEqual({ success: true });
    });

    it('ném NotFoundException khi task không tồn tại', async () => {
      vi.mocked(taskRepo.findOne!).mockResolvedValue(null);
      await expect(service.deleteTask('user-1', 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
