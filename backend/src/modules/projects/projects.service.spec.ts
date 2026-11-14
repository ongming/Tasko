import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ProjectsService } from './projects.service.js';
import { Project } from './entities/project.entity.js';
import { Status } from './entities/status.entity.js';
import { WorkType } from './entities/work-type.entity.js';
import { ProjectMember } from './entities/project-member.entity.js';
import { Workspace } from '../workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import { CreateProjectDto } from './dto/create-project.dto.js';

describe('ProjectsService - Unit Tests', () => {
  let service: ProjectsService;
  let projectRepo: Partial<Repository<Project>>;
  let statusRepo: Partial<Repository<Status>>;
  let workTypeRepo: Partial<Repository<WorkType>>;
  let projectMemberRepo: Partial<Repository<ProjectMember>>;
  let workspaceRepo: Partial<Repository<Workspace>>;
  let memberRepo: Partial<Repository<WorkspaceMember>>;
  let mockQueryRunner: any;

  const mockUserId = 'user-uuid-111';
  const mockWorkspaceId = 'ws-uuid-222';

  beforeEach(async () => {
    projectRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((data: any) => ({
        ...data,
        id: 'proj-uuid-333',
        created_at: new Date('2026-01-01'),
        updated_at: new Date('2026-01-01'),
      }) as Project),
      save: vi.fn(async (entity: any) => ({
        ...entity,
        id: entity.id || 'proj-uuid-333',
        created_at: entity.created_at || new Date('2026-01-01'),
        updated_at: entity.updated_at || new Date('2026-01-01'),
      })),
    };

    statusRepo = {
      find: vi.fn(),
    };

    workTypeRepo = {
      find: vi.fn(),
    };

    projectMemberRepo = {
      find: vi.fn(),
    };

    workspaceRepo = {
      findOne: vi.fn(),
    };

    memberRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
    };

    mockQueryRunner = {
      connect: vi.fn().mockResolvedValue(undefined),
      startTransaction: vi.fn().mockResolvedValue(undefined),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
      manager: {
        create: vi.fn((entityClass: any, data: any) => ({
          ...data,
          id: data.id || 'mock-generated-id',
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-01'),
        })),
        save: vi.fn(async (_entityClass: any, data: any) => {
          if (Array.isArray(data)) return data;
          return {
            ...data,
            id: data.id || 'proj-uuid-333',
            created_at: data.created_at || new Date('2026-01-01'),
            updated_at: data.updated_at || new Date('2026-01-01'),
          };
        }),
      },
    };

    const mockDataSource = {
      createQueryRunner: vi.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectRepo },
        { provide: getRepositoryToken(Status), useValue: statusRepo },
        { provide: getRepositoryToken(WorkType), useValue: workTypeRepo },
        { provide: getRepositoryToken(ProjectMember), useValue: projectMemberRepo },
        { provide: getRepositoryToken(Workspace), useValue: workspaceRepo },
        { provide: getRepositoryToken(WorkspaceMember), useValue: memberRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  // =========================================================
  // 1. HAPPY PATH
  // =========================================================
  describe('create - Happy Path', () => {
    it('tạo dự án thành công và chuẩn hóa chữ hoa cho key', async () => {
      workspaceRepo.findOne = vi.fn().mockResolvedValue({ id: mockWorkspaceId });
      memberRepo.findOne = vi.fn().mockResolvedValue({
        workspace_id: mockWorkspaceId,
        user_id: mockUserId,
        role: WorkspaceRole.OWNER,
      });
      projectRepo.findOne = vi.fn().mockResolvedValue(null); // Key chưa tồn tại

      const dto: CreateProjectDto = {
        name: '  Hệ Thống Bán Hàng  ',
        key: 'ecom',
        workspaceId: mockWorkspaceId,
        color: 'bg-emerald-600',
        description: '  Mô tả dự án  ',
      };

      const result = await service.create(mockUserId, dto);

      expect(workspaceRepo.findOne).toHaveBeenCalledWith({ where: { id: mockWorkspaceId } });
      expect(memberRepo.findOne).toHaveBeenCalledWith({
        where: { workspace_id: mockWorkspaceId, user_id: mockUserId },
      });
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        Project,
        expect.objectContaining({
          name: 'Hệ Thống Bán Hàng',
          key: 'ECOM',
          color: 'bg-emerald-600',
          description: 'Mô tả dự án',
          workspace_id: mockWorkspaceId,
          owner_id: mockUserId,
        }),
      );
      expect(result.key).toBe('ECOM');
      expect(result.name).toBe('Hệ Thống Bán Hàng');
      expect(result.workspaceId).toBe(mockWorkspaceId);
    });

    it('gán màu mặc định khi không truyền trường color', async () => {
      workspaceRepo.findOne = vi.fn().mockResolvedValue({ id: mockWorkspaceId });
      memberRepo.findOne = vi.fn().mockResolvedValue({
        workspace_id: mockWorkspaceId,
        user_id: mockUserId,
        role: WorkspaceRole.MEMBER,
      });
      projectRepo.findOne = vi.fn().mockResolvedValue(null);

      const dto: CreateProjectDto = {
        name: 'Dự án Mặc định',
        key: 'DEF',
        workspaceId: mockWorkspaceId,
      };

      const result = await service.create(mockUserId, dto);
      expect(result.color).toBe('bg-indigo-600');
    });
  });

  // =========================================================
  // 2. EXTREME / EDGE / PERMISSION CASES
  // =========================================================
  describe('create - Tình huống cực đoan & Bảo mật', () => {
    it('ném NotFoundException khi không tìm thấy Workspace', async () => {
      workspaceRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(
        service.create(mockUserId, {
          name: 'Project Test',
          key: 'TEST',
          workspaceId: 'non-existent-ws',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném ForbiddenException khi user không phải là thành viên của Workspace', async () => {
      workspaceRepo.findOne = vi.fn().mockResolvedValue({ id: mockWorkspaceId });
      memberRepo.findOne = vi.fn().mockResolvedValue(null); // User lạ

      await expect(
        service.create('stranger-user-id', {
          name: 'Project Test',
          key: 'TEST',
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ném ForbiddenException khi thành viên có vai trò VIEWER (chỉ xem)', async () => {
      workspaceRepo.findOne = vi.fn().mockResolvedValue({ id: mockWorkspaceId });
      memberRepo.findOne = vi.fn().mockResolvedValue({
        workspace_id: mockWorkspaceId,
        user_id: mockUserId,
        role: WorkspaceRole.VIEWER,
      });

      await expect(
        service.create(mockUserId, {
          name: 'Project Test',
          key: 'TEST',
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow('Thành viên chỉ xem (VIEWER) không có quyền tạo dự án mới!');
    });

    it('ném ConflictException khi mã dự án (Key) đã tồn tại trong cùng Workspace', async () => {
      workspaceRepo.findOne = vi.fn().mockResolvedValue({ id: mockWorkspaceId });
      memberRepo.findOne = vi.fn().mockResolvedValue({
        workspace_id: mockWorkspaceId,
        user_id: mockUserId,
        role: WorkspaceRole.ADMIN,
      });
      // Đã có dự án mang key 'TASKO' trong workspace này
      projectRepo.findOne = vi.fn().mockResolvedValue({
        id: 'existing-proj-id',
        key: 'TASKO',
        workspace_id: mockWorkspaceId,
      });

      await expect(
        service.create(mockUserId, {
          name: 'Tasko Web',
          key: 'tasko', // Viết thường nhưng phải bị chặn vì trùng 'TASKO'
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // =========================================================
  // 3. READ QUERIES (findAllByWorkspace, findById)
  // =========================================================
  describe('findAllByWorkspace & findById', () => {
    it('lấy danh sách dự án thành công khi user là thành viên', async () => {
      memberRepo.findOne = vi.fn().mockResolvedValue({
        workspace_id: mockWorkspaceId,
        user_id: mockUserId,
      });
      projectRepo.find = vi.fn().mockResolvedValue([
        { id: 'p1', name: 'P1', key: 'P1', workspace_id: mockWorkspaceId, owner_id: mockUserId },
        { id: 'p2', name: 'P2', key: 'P2', workspace_id: mockWorkspaceId, owner_id: mockUserId },
      ]);

      const list = await service.findAllByWorkspace(mockUserId, mockWorkspaceId);
      expect(list.length).toBe(2);
      expect(list[0].key).toBe('P1');
    });

    it('chặn truy cập danh sách dự án nếu không thuộc workspace', async () => {
      memberRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(service.findAllByWorkspace(mockUserId, 'private-ws')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('trả về rỗng [] khi lấy tất cả dự án nhưng user chưa tham gia workspace nào', async () => {
      memberRepo.find = vi.fn().mockResolvedValue([]); // Không có workspace nào

      const list = await service.findAllByWorkspace(mockUserId);
      expect(list).toEqual([]);
    });

    it('lấy chi tiết dự án theo ID thành công', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({
        id: 'proj-1',
        name: 'Project One',
        key: 'P1',
        workspace_id: mockWorkspaceId,
        owner_id: mockUserId,
      });
      memberRepo.findOne = vi.fn().mockResolvedValue({
        workspace_id: mockWorkspaceId,
        user_id: mockUserId,
      });

      const result = await service.findById(mockUserId, 'proj-1');
      expect(result.id).toBe('proj-1');
      expect(result.name).toBe('Project One');
    });

    it('ném NotFoundException khi không tìm thấy ID dự án', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(service.findById(mockUserId, 'non-existent-proj')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ném ForbiddenException khi xem chi tiết dự án thuộc workspace mà user không có quyền', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({
        id: 'proj-secret',
        workspace_id: 'secret-ws-id',
      });
      memberRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(service.findById(mockUserId, 'proj-secret')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // =========================================================
  // 4. DTO VALIDATION TESTS
  // =========================================================
  describe('CreateProjectDto - Validation Tests', () => {
    it('chấp nhận DTO chuẩn hợp lệ', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 'Tasko Agile System',
        key: 'TASKO',
        workspaceId: '123e4567-e89b-12d3-a456-426614174000',
        color: 'bg-indigo-600',
        description: 'Quản lý dự án Scrum & Kanban',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('chặn tên để trống hoặc vượt quá 100 ký tự', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 'a'.repeat(101),
        key: 'KEY',
        workspaceId: '123e4567-e89b-12d3-a456-426614174000',
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('chặn Key có độ dài < 2 hoặc > 10 ký tự', async () => {
      const shortDto = plainToInstance(CreateProjectDto, {
        name: 'Name',
        key: 'K',
        workspaceId: '123e4567-e89b-12d3-a456-426614174000',
      });
      const longDto = plainToInstance(CreateProjectDto, {
        name: 'Name',
        key: 'VERYLONGKEY123',
        workspaceId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect((await validate(shortDto)).some((e) => e.property === 'key')).toBe(true);
      expect((await validate(longDto)).some((e) => e.property === 'key')).toBe(true);
    });

    it('chặn Key chứa khoảng trắng, ký tự đặc biệt hoặc dấu tiếng Việt', async () => {
      const payloads = ['PRO J', 'PR-1', 'PRO@', 'DỰÁN', 'PR#OJ'];
      for (const invalidKey of payloads) {
        const dto = plainToInstance(CreateProjectDto, {
          name: 'Valid Name',
          key: invalidKey,
          workspaceId: '123e4567-e89b-12d3-a456-426614174000',
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'key')).toBe(true);
      }
    });

    it('chặn workspaceId không phải định dạng UUID', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 'Valid Name',
        key: 'VALID',
        workspaceId: 'invalid-not-uuid',
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'workspaceId')).toBe(true);
    });
  });
});
