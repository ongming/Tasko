import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { TasksService } from './tasks.service.js';
import { Task, TaskPriority } from './entities/task.entity.js';
import { Status } from '../projects/entities/status.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { CustomField, CustomFieldType } from '../projects/entities/custom-field.entity.js';
import { CustomFieldValue } from './entities/custom-field-value.entity.js';
import { WorkflowTransition } from '../projects/entities/workflow-transition.entity.js';

describe('TasksService - Unit Tests', () => {
  let service: TasksService;
  let taskRepo: Partial<Repository<Task>>;
  let statusRepo: Partial<Repository<Status>>;
  let workTypeRepo: Partial<Repository<WorkType>>;
  let projectRepo: Partial<Repository<Project>>;
  let customFieldRepo: Partial<Repository<CustomField>>;
  let customFieldValueRepo: Partial<Repository<CustomFieldValue>>;
  let workflowTransitionRepo: Partial<Repository<WorkflowTransition>>;

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
      find: vi.fn(),
      count: vi.fn(),
    };

    workTypeRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
    };

    projectRepo = {
      findOne: vi.fn().mockResolvedValue({ id: mockProjectId, key: 'PROJ' } as Project),
    };

    customFieldRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      count: vi.fn(),
    };

    customFieldValueRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'cfv-uuid-1' })),
      save: vi.fn(async (entity: any) => entity),
      createQueryBuilder: vi.fn().mockReturnValue({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      }),
    };

    workflowTransitionRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(Status), useValue: statusRepo },
        { provide: getRepositoryToken(WorkType), useValue: workTypeRepo },
        { provide: getRepositoryToken(Project), useValue: projectRepo },
        { provide: getRepositoryToken(CustomField), useValue: customFieldRepo },
        { provide: getRepositoryToken(CustomFieldValue), useValue: customFieldValueRepo },
        { provide: getRepositoryToken(WorkflowTransition), useValue: workflowTransitionRepo },
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

    it('ném BadRequestException khi thiếu trường CustomField có isRequired = true', async () => {
      vi.mocked(customFieldRepo.find!).mockResolvedValue([
        {
          id: 'cf-req-1',
          name: 'Story Points Estimate',
          fieldType: CustomFieldType.NUMBER,
          isRequired: true,
          projectId: mockProjectId,
        } as CustomField,
      ]);

      await expect(
        service.createTask('user-1', mockProjectId, {
          title: 'Task thiếu custom field bắt buộc',
          customFields: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lưu CustomFieldValue thành công khi tạo task có customFields hợp lệ', async () => {
      vi.mocked(customFieldRepo.find!).mockResolvedValue([
        {
          id: 'cf-req-1',
          name: 'Release Date',
          fieldType: CustomFieldType.DATE,
          isRequired: true,
          projectId: mockProjectId,
        } as CustomField,
      ]);
      vi.mocked(taskRepo.count!).mockResolvedValue(1);
      vi.mocked(statusRepo.findOne!).mockResolvedValue({ id: 'status-1', name: 'To Do' } as Status);
      vi.mocked(workTypeRepo.findOne!).mockResolvedValue({ id: 'wt-1', name: 'Task' } as WorkType);
      vi.mocked(taskRepo.save!).mockResolvedValue({ id: mockTaskId } as Task);
      vi.mocked(taskRepo.findOne!).mockResolvedValue({
        id: mockTaskId,
        project_id: mockProjectId,
        task_key: 'PROJ-2',
        title: 'Task có Custom Field',
        status: { id: 'status-1', name: 'To Do', category: 'TODO', color: '#ccc' },
        type: null,
        assignee: null,
        reporter: null,
      } as any);

      const result = await service.createTask('user-1', mockProjectId, {
        title: 'Task có Custom Field',
        customFields: [{ customFieldId: 'cf-req-1', value: '2026-12-01' }],
      });

      expect(customFieldValueRepo.save).toHaveBeenCalled();
      expect(result.id).toBe(mockTaskId);
    });

    it('ném NotFoundException khi parentTaskId không tồn tại', async () => {
      vi.mocked(taskRepo.findOne!).mockResolvedValue(null);

      await expect(
        service.createTask('user-1', mockProjectId, {
          title: 'Subtask thất bại',
          parentTaskId: 'non-existent-parent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném BadRequestException khi công việc cha không thuộc dự án này', async () => {
      vi.mocked(taskRepo.findOne!).mockResolvedValue({
        id: 'parent-other-proj',
        project_id: 'different-project-id',
      } as Task);

      await expect(
        service.createTask('user-1', mockProjectId, {
          title: 'Subtask khác dự án',
          parentTaskId: 'parent-other-proj',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException khi công việc cha đã là subtask', async () => {
      vi.mocked(taskRepo.findOne!).mockResolvedValue({
        id: 'parent-subtask',
        project_id: mockProjectId,
        parent_task_id: 'grandparent-task',
      } as Task);

      await expect(
        service.createTask('user-1', mockProjectId, {
          title: 'Subtask lồng 2 cấp',
          parentTaskId: 'parent-subtask',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('moveTask', () => {
    it('sắp xếp lại trong cùng 1 cột không bị chặn bởi WIP Limit hay Workflow Transition', async () => {
      const mockTask = {
        id: mockTaskId,
        project_id: mockProjectId,
        status_id: 'status-1',
        position: 1000,
        status: { id: 'status-1', name: 'In Progress' },
        type: { id: 'wt-1', name: 'Bug', workflowId: 'wf-1' },
      } as any;

      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(taskRepo.save!).mockResolvedValue({ ...mockTask, position: 2500 });
      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce({
        ...mockTask,
        position: 2500,
      });

      // Di chuyển trong cùng cột status-1
      const result = await service.moveTask('user-1', mockTaskId, {
        statusId: 'status-1',
        position: 2500,
      });

      expect(result.position).toBe(2500);
      expect(workflowTransitionRepo.findOne).not.toHaveBeenCalled();
      expect(taskRepo.count).not.toHaveBeenCalled();
    });

    it('ném BadRequestException khi chuyển sang cột khác vi phạm WorkflowTransition', async () => {
      const mockTask = {
        id: mockTaskId,
        project_id: mockProjectId,
        status_id: 'status-todo',
        status: { id: 'status-todo', name: 'To Do' },
        type: { id: 'wt-1', name: 'Task', workflowId: 'wf-strict-1' },
      } as any;

      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(statusRepo.findOne!).mockResolvedValue({
        id: 'status-done',
        name: 'Done',
        project_id: mockProjectId,
      } as Status);

      // Workflow Transition từ To Do -> Done không tồn tại
      vi.mocked(workflowTransitionRepo.findOne!).mockResolvedValue(null);

      await expect(
        service.moveTask('user-1', mockTaskId, {
          toStatusId: 'status-done',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException khi chuyển sang cột đích đã đạt giới hạn WIP limit', async () => {
      const mockTask = {
        id: mockTaskId,
        project_id: mockProjectId,
        status_id: 'status-todo',
        status: { id: 'status-todo', name: 'To Do' },
        type: { id: 'wt-1', name: 'Task', workflowId: 'wf-1' },
      } as any;

      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(statusRepo.findOne!).mockResolvedValue({
        id: 'status-in-progress',
        name: 'In Progress',
        project_id: mockProjectId,
        wipLimit: 3,
      } as Status);

      // Transition hợp lệ
      vi.mocked(workflowTransitionRepo.findOne!).mockResolvedValue({
        id: 'trans-1',
        workflowId: 'wf-1',
        fromStatusId: 'status-todo',
        toStatusId: 'status-in-progress',
      } as any);

      // Cột In Progress đã có 3 task (đạt giới hạn WIP 3)
      vi.mocked(taskRepo.count!).mockResolvedValue(3);

      await expect(
        service.moveTask('user-1', mockTaskId, {
          toStatusId: 'status-in-progress',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('chuyển cột thành công khi quy trình cho phép và chưa vượt WIP limit', async () => {
      const mockTask = {
        id: mockTaskId,
        project_id: mockProjectId,
        status_id: 'status-todo',
        status: { id: 'status-todo', name: 'To Do' },
        type: { id: 'wt-1', name: 'Task', workflowId: 'wf-1' },
      } as any;

      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(statusRepo.findOne!).mockResolvedValue({
        id: 'status-in-progress',
        name: 'In Progress',
        project_id: mockProjectId,
        wipLimit: 5,
      } as Status);

      // Transition hợp lệ
      vi.mocked(workflowTransitionRepo.findOne!).mockResolvedValue({
        id: 'trans-1',
        workflowId: 'wf-1',
        fromStatusId: 'status-todo',
        toStatusId: 'status-in-progress',
      } as any);

      // Cột hiện có 2 task < 5
      vi.mocked(taskRepo.count!).mockResolvedValue(2);
      vi.mocked(taskRepo.save!).mockResolvedValue({
        ...mockTask,
        status_id: 'status-in-progress',
        position: 3000,
      });
      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce({
        ...mockTask,
        status_id: 'status-in-progress',
        position: 3000,
        status: { id: 'status-in-progress', name: 'In Progress' },
      });

      const result = await service.moveTask('user-1', mockTaskId, {
        toStatusId: 'status-in-progress',
        position: 3000,
      });

      expect(result.statusId).toBe('status-in-progress');
      expect(result.position).toBe(3000);
    });
  });

  describe('updateTask', () => {
    it('ném BadRequestException khi cập nhật statusId vi phạm WorkflowTransition', async () => {
      const mockTask = {
        id: mockTaskId,
        project_id: mockProjectId,
        status_id: 'status-todo',
        status: { id: 'status-todo', name: 'To Do' },
        type: { id: 'wt-1', name: 'Task', workflowId: 'wf-strict-1' },
      } as any;

      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(statusRepo.findOne!).mockResolvedValue({
        id: 'status-done',
        name: 'Done',
        project_id: mockProjectId,
      } as Status);
      vi.mocked(workflowTransitionRepo.findOne!).mockResolvedValue(null);

      await expect(
        service.updateTask('user-1', mockTaskId, {
          statusId: 'status-done',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException khi cập nhật statusId vượt quá WIP limit', async () => {
      const mockTask = {
        id: mockTaskId,
        project_id: mockProjectId,
        status_id: 'status-todo',
        status: { id: 'status-todo', name: 'To Do' },
        type: { id: 'wt-1', name: 'Task', workflowId: 'wf-1' },
      } as any;

      vi.mocked(taskRepo.findOne!).mockResolvedValueOnce(mockTask);
      vi.mocked(statusRepo.findOne!).mockResolvedValue({
        id: 'status-in-progress',
        name: 'In Progress',
        project_id: mockProjectId,
        wipLimit: 2,
      } as Status);
      vi.mocked(workflowTransitionRepo.findOne!).mockResolvedValue({} as any);
      vi.mocked(taskRepo.count!).mockResolvedValue(2); // đã đủ 2

      await expect(
        service.updateTask('user-1', mockTaskId, {
          statusId: 'status-in-progress',
        }),
      ).rejects.toThrow(BadRequestException);
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
