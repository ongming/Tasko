import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspacesService } from './workspaces.service.js';
import { Workspace } from './entities/workspace.entity.js';
import { WorkspaceMember } from './entities/workspace-member.entity.js';
import { WorkspaceRole } from './enums/workspace-role.enum.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';

describe('WorkspacesService - Create Workspace', () => {
  let service: WorkspacesService;
  let workspaceRepo: Partial<Repository<Workspace>>;
  let memberRepo: Partial<Repository<WorkspaceMember>>;
  let queryRunnerMock: any;
  let dataSourceMock: Partial<DataSource>;

  beforeEach(async () => {
    queryRunnerMock = {
      connect: vi.fn().mockResolvedValue(undefined),
      startTransaction: vi.fn().mockResolvedValue(undefined),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
      manager: {
        create: vi.fn((entityClass, data) => ({
          ...data,
          id: 'ws-mock-id',
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-01'),
        })),
        save: vi.fn(async (entity) => entity),
      },
    };

    workspaceRepo = {
      findOne: vi.fn(),
    };

    memberRepo = {
      find: vi.fn(),
    };

    dataSourceMock = {
      createQueryRunner: vi.fn().mockReturnValue(queryRunnerMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: workspaceRepo,
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: memberRepo,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('nên khởi tạo thành công service', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const userId = 'user-123';
    const createDto: CreateWorkspaceDto = {
      name: '  Tasko Workspace  ',
      slug: '  tasko-team  ',
      description: '  Không gian làm việc chính  ',
    };

    it('nên ném ra ConflictException khi slug đã tồn tại trong hệ thống', async () => {
      // Giả lập slug đã tồn tại
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue({
        id: 'existing-id',
        slug: 'tasko-team',
      } as Workspace);

      await expect(service.create(userId, createDto)).rejects.toThrow(ConflictException);
      expect(workspaceRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 'tasko-team' },
      });
      // Không được mở transaction nếu slug đã trùng
      expect(dataSourceMock.createQueryRunner).not.toHaveBeenCalled();
    });

    it('nên tạo Workspace mới, gán quyền OWNER cho Creator và commit transaction thành công', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue(null);

      const result = await service.create(userId, createDto);

      // 1. Kiểm tra mở transaction
      expect(dataSourceMock.createQueryRunner).toHaveBeenCalled();
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();

      // 2. Kiểm tra tạo workspace với dữ liệu chuẩn hóa (trim)
      expect(queryRunnerMock.manager.create).toHaveBeenCalledWith(Workspace, {
        name: 'Tasko Workspace',
        slug: 'tasko-team',
        description: 'Không gian làm việc chính',
        owner_id: userId,
      });

      // 3. Kiểm tra gán quyền OWNER cho Creator
      expect(queryRunnerMock.manager.create).toHaveBeenCalledWith(WorkspaceMember, {
        workspace_id: 'ws-mock-id',
        user_id: userId,
        role: WorkspaceRole.OWNER,
      });

      // 4. Kiểm tra commit và release transaction
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();

      // 5. Kiểm tra kết quả trả về đúng chuẩn WorkspaceResponseDto
      expect(result).toMatchObject({
        id: 'ws-mock-id',
        name: 'Tasko Workspace',
        slug: 'tasko-team',
        description: 'Không gian làm việc chính',
        role: WorkspaceRole.OWNER,
        ownerId: userId,
        memberCount: 1,
      });
    });

    it('nên rollback transaction và giải phóng queryRunner khi xảy ra lỗi trong quá trình lưu', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue(null);
      const dbError = new Error('Database connection lost');
      queryRunnerMock.manager.save.mockRejectedValueOnce(dbError);

      await expect(service.create(userId, createDto)).rejects.toThrow('Database connection lost');

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).not.toHaveBeenCalled();
    });
  });
});
