import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SprintsService } from './sprints.service.js';
import { Sprint, SprintStatus } from './entities/sprint.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { StatusCategory } from '../projects/entities/status.entity.js';

describe('SprintsService - Unit Tests', () => {
  let service: SprintsService;
  let sprintRepo: Partial<Repository<Sprint>>;
  let taskRepo: Partial<Repository<Task>>;
  let projectRepo: Partial<Repository<Project>>;

  const mockProjectId = 'project-uuid-111';
  const mockSprintId = 'sprint-uuid-222';

  beforeEach(async () => {
    sprintRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: mockSprintId })),
      save: vi.fn(async (entity: any) => ({ ...entity, id: entity.id || mockSprintId })),
      count: vi.fn(),
      remove: vi.fn(),
      update: vi.fn(),
    };

    taskRepo = {
      find: vi.fn(),
      save: vi.fn(async (entity: any) => entity),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
    };

    projectRepo = {
      findOne: vi.fn().mockResolvedValue({ id: mockProjectId, key: 'PROJ' } as Project),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        { provide: getRepositoryToken(Sprint), useValue: sprintRepo },
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(Project), useValue: projectRepo },
      ],
    }).compile();

    service = module.get<SprintsService>(SprintsService);
  });

  describe('createSprint', () => {
    it('tạo sprint với tên mặc định khi không truyền tên', async () => {
      vi.mocked(sprintRepo.count!).mockResolvedValue(2);
      vi.mocked(sprintRepo.create!).mockReturnValue({
        id: mockSprintId,
        project_id: mockProjectId,
        name: 'Sprint 3',
        goal: null,
        status: SprintStatus.PLANNED,
        start_date: null,
        end_date: null,
        position: 3000,
      } as Sprint);
      vi.mocked(sprintRepo.save!).mockResolvedValue({
        id: mockSprintId,
        project_id: mockProjectId,
        name: 'Sprint 3',
        status: SprintStatus.PLANNED,
      } as Sprint);

      const result = await service.createSprint('user-1', mockProjectId, {});
      expect(result.name).toBe('Sprint 3');
      expect(sprintRepo.count).toHaveBeenCalledWith({ where: { project_id: mockProjectId } });
    });

    it('tạo sprint với tên tùy chỉnh', async () => {
      vi.mocked(sprintRepo.count!).mockResolvedValue(0);
      vi.mocked(sprintRepo.create!).mockReturnValue({
        id: mockSprintId,
        project_id: mockProjectId,
        name: 'Sprint Kick-off',
        status: SprintStatus.PLANNED,
      } as Sprint);
      vi.mocked(sprintRepo.save!).mockResolvedValue({
        id: mockSprintId,
        name: 'Sprint Kick-off',
      } as Sprint);

      const result = await service.createSprint('user-1', mockProjectId, { name: 'Sprint Kick-off' });
      expect(result.name).toBe('Sprint Kick-off');
    });

    it('ném NotFoundException khi không tìm thấy project', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue(null);
      await expect(service.createSprint('user-1', 'non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSprints', () => {
    it('lấy danh sách sprints thành công', async () => {
      const mockSprint = {
        id: mockSprintId,
        project_id: mockProjectId,
        name: 'Sprint 1',
        goal: 'Mục tiêu',
        status: SprintStatus.ACTIVE,
        start_date: new Date(),
        end_date: new Date(),
        position: 1000,
      } as Sprint;
      vi.mocked(sprintRepo.find!).mockResolvedValue([mockSprint]);
      vi.mocked(taskRepo.find!).mockResolvedValue([
        { id: 't1', sprint_id: mockSprintId, story_points: 5, status: { category: StatusCategory.DONE } },
        { id: 't2', sprint_id: mockSprintId, story_points: 3, status: { category: StatusCategory.IN_PROGRESS } },
      ] as any);

      const result = await service.getSprints(mockProjectId);
      expect(result).toHaveLength(1);
      expect(result[0].totalPoints).toBe(8);
      expect(result[0].completedPoints).toBe(5);
    });
  });

  describe('updateSprint', () => {
    it('cập nhật sprint thành công', async () => {
      const mockSprint = {
        id: mockSprintId,
        name: 'Sprint 1',
        goal: null,
        start_date: null,
        end_date: null,
        status: SprintStatus.PLANNED,
        position: 1000,
      } as Sprint;
      vi.mocked(sprintRepo.findOne!).mockResolvedValue(mockSprint);
      vi.mocked(sprintRepo.save!).mockResolvedValue({ ...mockSprint, name: 'Sprint 1 Updated' } as Sprint);

      const result = await service.updateSprint('user-1', mockSprintId, { name: 'Sprint 1 Updated' });
      expect(result.name).toBe('Sprint 1 Updated');
    });

    it('ném NotFoundException khi sprint không tồn tại', async () => {
      vi.mocked(sprintRepo.findOne!).mockResolvedValue(null);
      await expect(service.updateSprint('user-1', 'non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('startSprint', () => {
    it('bắt đầu sprint thành công', async () => {
      const mockSprint = {
        id: mockSprintId,
        project_id: mockProjectId,
        name: 'Sprint 1',
        status: SprintStatus.PLANNED,
      } as Sprint;
      vi.mocked(sprintRepo.findOne!).mockResolvedValueOnce(mockSprint);
      vi.mocked(sprintRepo.findOne!).mockResolvedValueOnce(null);
      vi.mocked(sprintRepo.save!).mockResolvedValue({ ...mockSprint, status: SprintStatus.ACTIVE } as Sprint);

      const result = await service.startSprint('user-1', mockSprintId, {
        startDate: '2026-01-01',
        endDate: '2026-01-14',
      });
      expect(result.status).toBe(SprintStatus.ACTIVE);
    });

    it('ném BadRequestException khi sprint rỗng (0 task)', async () => {
      const mockSprint = { id: mockSprintId, project_id: mockProjectId } as Sprint;
      vi.mocked(sprintRepo.findOne!).mockResolvedValueOnce(mockSprint);
      vi.mocked(sprintRepo.findOne!).mockResolvedValueOnce(null);
      vi.mocked(taskRepo.count!).mockResolvedValueOnce(0);

      await expect(
        service.startSprint('user-1', mockSprintId, {
          startDate: '2026-01-01',
          endDate: '2026-01-14',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException khi đã có sprint đang hoạt động', async () => {
      const mockSprint = { id: mockSprintId, project_id: mockProjectId } as Sprint;
      const otherActive = { id: 'other-sprint', project_id: mockProjectId, name: 'Sprint 0', status: SprintStatus.ACTIVE } as Sprint;
      vi.mocked(sprintRepo.findOne!).mockResolvedValueOnce(mockSprint);
      vi.mocked(sprintRepo.findOne!).mockResolvedValueOnce(otherActive);

      await expect(service.startSprint('user-1', mockSprintId, {
        startDate: '2026-01-01',
        endDate: '2026-01-14',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeSprint', () => {
    it('hoàn thành sprint, chuyển task chưa xong về backlog', async () => {
      const mockSprint = { id: mockSprintId, project_id: mockProjectId, status: SprintStatus.ACTIVE } as Sprint;
      vi.mocked(sprintRepo.findOne!).mockResolvedValue(mockSprint);

      const doneSprint = { id: mockSprintId, status: SprintStatus.COMPLETED } as Sprint;
      vi.mocked(sprintRepo.save!).mockResolvedValue(doneSprint);

      const incompletedTask = {
        id: 'task-1',
        sprint_id: mockSprintId,
        status: { category: StatusCategory.IN_PROGRESS },
      };
      vi.mocked(taskRepo.find!).mockResolvedValue([incompletedTask] as any);
      vi.mocked(taskRepo.save!).mockResolvedValue({ ...incompletedTask, sprint_id: null } as any);

      const result = await service.completeSprint('user-1', mockSprintId, {});
      expect(result.sprint.status).toBe(SprintStatus.COMPLETED);
      expect(result.uncompletedTaskCount).toBe(1);
    });

    it('ném NotFoundException khi sprint không tồn tại', async () => {
      vi.mocked(sprintRepo.findOne!).mockResolvedValue(null);
      await expect(service.completeSprint('user-1', 'non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSprint', () => {
    it('xóa sprint thành công và trả về { success: true }', async () => {
      const mockSprint = { id: mockSprintId } as Sprint;
      vi.mocked(sprintRepo.findOne!).mockResolvedValue(mockSprint);
      vi.mocked(taskRepo.update!).mockResolvedValue(undefined as any);
      vi.mocked(sprintRepo.remove!).mockResolvedValue(mockSprint);

      const result = await service.deleteSprint('user-1', mockSprintId);
      expect(result).toEqual({ success: true });
    });

    it('ném NotFoundException khi sprint không tồn tại', async () => {
      vi.mocked(sprintRepo.findOne!).mockResolvedValue(null);
      await expect(service.deleteSprint('user-1', 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
