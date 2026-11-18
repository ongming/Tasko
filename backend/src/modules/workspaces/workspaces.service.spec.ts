import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspacesService } from './workspaces.service.js';
import { Workspace } from './entities/workspace.entity.js';
import { WorkspaceMember } from './entities/workspace-member.entity.js';
import { User } from '../auth/entities/user.entity.js';
import { Role, RoleScope } from '../rbac/entities/role.entity.js';
import { WorkspaceRole } from './enums/workspace-role.enum.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';

describe('WorkspacesService - Unit Tests', () => {
  let service: WorkspacesService;
  let workspaceRepo: Partial<Repository<Workspace>>;
  let memberRepo: Partial<Repository<WorkspaceMember>>;
  let userRepo: Partial<Repository<User>>;
  let roleRepo: Partial<Repository<Role>>;
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
        findOne: vi.fn().mockResolvedValue({ id: 'role-admin-id' }),
      },
    };

    workspaceRepo = {
      findOne: vi.fn(),
    };

    memberRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'member-mock-id' })),
      save: vi.fn(async (data: any) => ({ ...data, id: data.id || 'member-mock-id' })),
      remove: vi.fn(),
      count: vi.fn(),
    };

    userRepo = {
      findOne: vi.fn(),
    };

    roleRepo = {
      findOne: vi.fn(),
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
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepo,
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

  describe('create() - Luồng cơ bản', () => {
    const userId = 'user-123';
    const createDto: CreateWorkspaceDto = {
      name: '  Tasko Workspace  ',
      slug: '  tasko-team  ',
      description: '  Không gian làm việc chính  ',
    };

    it('nên ném ra ConflictException khi slug đã tồn tại trong hệ thống', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue({
        id: 'existing-id',
        slug: 'tasko-team',
      } as Workspace);

      await expect(service.create(userId, createDto)).rejects.toThrow(ConflictException);
      expect(workspaceRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 'tasko-team' },
      });
      expect(dataSourceMock.createQueryRunner).not.toHaveBeenCalled();
    });

    it('nên tạo Workspace mới, gán quyền OWNER cho Creator và commit transaction thành công', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue(null);

      const result = await service.create(userId, createDto);

      expect(dataSourceMock.createQueryRunner).toHaveBeenCalled();
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();

      expect(queryRunnerMock.manager.create).toHaveBeenCalledWith(Workspace, {
        name: 'Tasko Workspace',
        slug: 'tasko-team',
        description: 'Không gian làm việc chính',
        owner_id: userId,
      });

      expect(queryRunnerMock.manager.create).toHaveBeenCalledWith(WorkspaceMember, {
        workspace_id: 'ws-mock-id',
        user_id: userId,
        role: WorkspaceRole.OWNER,
        roleId: 'role-admin-id',
      });

      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();

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

  describe('create() - Tình huống cực đoan & Lỗ hổng bảo mật', () => {
    const userId = 'user-attacker-999';

    it('Tình huống Race Condition: Bị trùng khóa UNIQUE ở mức DB (Postgres 23505) -> Phải rollback sạch sẽ', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue(null);
      const uniqueViolationError = new Error('duplicate key value violates unique constraint "UQ_workspace_slug"');
      queryRunnerMock.manager.save.mockRejectedValueOnce(uniqueViolationError);

      await expect(
        service.create(userId, { name: 'Race Team', slug: 'race-team' }),
      ).rejects.toThrow('duplicate key value violates unique constraint');

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).not.toHaveBeenCalled();
    });

    it('Tình huống lỗi nửa chừng: Lưu Workspace xong nhưng lưu Member thất bại -> Phải hủy luôn Workspace, không để mồ côi', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue(null);
      // Lần save thứ 1 (Workspace) thành công, lần save thứ 2 (Member) văng lỗi
      queryRunnerMock.manager.save
        .mockResolvedValueOnce({ id: 'ws-mock-id', name: 'Broken WS' })
        .mockRejectedValueOnce(new Error('Cannot insert member constraint error'));

      await expect(
        service.create(userId, { name: 'Broken WS', slug: 'broken-ws' }),
      ).rejects.toThrow('Cannot insert member constraint error');

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('Chuẩn hóa dữ liệu: Description chỉ chứa khoảng trắng "   " hoặc undefined phải lưu thành null', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue(null);

      await service.create(userId, {
        name: 'Space Test',
        slug: 'space-test',
        description: '    ',
      });

      expect(queryRunnerMock.manager.create).toHaveBeenCalledWith(
        Workspace,
        expect.objectContaining({
          description: null,
        }),
      );
    });

    it('Chuẩn hóa dữ liệu: Slug viết hoa lộn xộn "My-NEW-Workspace" phải tự động hạ về chữ thường "my-new-workspace"', async () => {
      vi.mocked(workspaceRepo.findOne!).mockResolvedValue(null);

      await service.create(userId, {
        name: 'Mixed Case',
        slug: '  My-NEW-Workspace  ',
      });

      expect(queryRunnerMock.manager.create).toHaveBeenCalledWith(
        Workspace,
        expect.objectContaining({
          slug: 'my-new-workspace',
        }),
      );
    });
  });

  describe('CreateWorkspaceDto - Kiểm thử Validation & Ký tự độc hại', () => {
    const toDto = (raw: any) => plainToInstance(CreateWorkspaceDto, raw);

    it('Hợp lệ: DTO chuẩn đầy đủ dữ liệu phải vượt qua validation 100%', async () => {
      const dto = toDto({
        name: 'Công ty Công nghệ Việt',
        slug: 'cong-ty-cong-nghe-viet',
        description: 'Mô tả hợp lệ ngắn gọn',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('Độc hại: Chặn slug chứa ký tự lạ, path traversal, dấu cách, ký tự hoa', async () => {
      const maliciousSlugs = [
        '../root-admin',
        'tasko/admin',
        'tasko#evil',
        'tasko@team',
        'tasko team',
        'TASKO-TEAM',
        '-tasko-team',
        'tasko-team-',
        'tasko--team',
        'tasko?query=1',
        '<script>',
      ];

      for (const badSlug of maliciousSlugs) {
        const dto = toDto({
          name: 'Valid Name',
          slug: badSlug,
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]?.property).toBe('slug');
      }
    });

    it('Cực đoan: Chặn Tên vượt quá 100 ký tự (Buffer Overrun)', async () => {
      const dto = toDto({
        name: 'A'.repeat(101),
        slug: 'valid-slug',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('Cực đoan: Chặn Slug vượt quá 50 ký tự', async () => {
      const dto = toDto({
        name: 'Valid Name',
        slug: 'a'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'slug')).toBe(true);
    });

    it('Cực đoan: Chặn Mô tả vượt quá 500 ký tự', async () => {
      const dto = toDto({
        name: 'Valid Name',
        slug: 'valid-slug',
        description: 'D'.repeat(501),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('Rỗng: Chặn trường hợp name hoặc slug rỗng', async () => {
      const dto = toDto({
        name: '',
        slug: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(errors.some((e) => e.property === 'slug')).toBe(true);
    });
  });

  describe('Quản lý thành viên Workspace', () => {
    const wsId = 'ws-uuid-111';
    const userId = 'user-uuid-222';
    const roleId = 'role-uuid-333';

    it('getMembers: lấy danh sách thành viên thành công', async () => {
      vi.mocked(memberRepo.find!).mockResolvedValue([
        {
          id: 'm-1',
          user_id: userId,
          user: { id: userId, email: 'test@example.com', full_name: 'Test', avatar_url: null },
          roleId,
          roleEntity: { id: roleId, name: 'ADMIN' },
          role: WorkspaceRole.ADMIN,
          joined_at: new Date(),
        } as any,
      ]);

      const res = await service.getMembers(wsId);
      expect(res).toHaveLength(1);
      expect(res[0].user.email).toBe('test@example.com');
    });

    it('addMember: thêm thành viên mới thành công', async () => {
      vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: roleId, name: 'MEMBER', scope: RoleScope.WORKSPACE } as Role);
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: userId, email: 'new@example.com', full_name: 'New', avatar_url: null } as User);
      vi.mocked(memberRepo.findOne!).mockResolvedValue(null);

      const res = await service.addMember(wsId, { email: 'new@example.com', roleId });
      expect(res.userId).toBe(userId);
      expect(memberRepo.save).toHaveBeenCalled();
    });

    it('addMember: ném NotFoundException khi không tìm thấy email', async () => {
      vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: roleId, name: 'MEMBER', scope: RoleScope.WORKSPACE } as Role);
      vi.mocked(userRepo.findOne!).mockResolvedValue(null);

      await expect(service.addMember(wsId, { email: 'notfound@example.com', roleId })).rejects.toThrow(NotFoundException);
    });

    it('addMember: ném ConflictException khi đã là thành viên', async () => {
      vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: roleId, name: 'MEMBER', scope: RoleScope.WORKSPACE } as Role);
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: userId, email: 'exist@example.com' } as User);
      vi.mocked(memberRepo.findOne!).mockResolvedValue({ id: 'm-exist' } as any);

      await expect(service.addMember(wsId, { email: 'exist@example.com', roleId })).rejects.toThrow(ConflictException);
    });

    it('updateMemberRole: chặn hạ quyền khi là ADMIN duy nhất', async () => {
      vi.mocked(memberRepo.findOne!).mockResolvedValue({
        id: 'm-1',
        workspace_id: wsId,
        user_id: userId,
        roleEntity: { name: 'ADMIN' },
        role: WorkspaceRole.ADMIN,
      } as any);

      vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: 'member-role-id', name: 'MEMBER', scope: RoleScope.WORKSPACE } as Role);
      // Chỉ có 1 admin trong workspace
      vi.mocked(memberRepo.find!).mockResolvedValue([
        { roleEntity: { name: 'ADMIN' }, role: WorkspaceRole.ADMIN },
      ] as any);

      await expect(
        service.updateMemberRole(wsId, userId, { roleId: 'member-role-id' }),
      ).rejects.toThrow('Không thể hạ vai trò Quản trị viên duy nhất của Không gian làm việc!');
    });

    it('removeMember: chặn xóa khi là ADMIN duy nhất', async () => {
      vi.mocked(memberRepo.findOne!).mockResolvedValue({
        id: 'm-1',
        workspace_id: wsId,
        user_id: userId,
        roleEntity: { name: 'ADMIN' },
        role: WorkspaceRole.ADMIN,
      } as any);

      vi.mocked(memberRepo.find!).mockResolvedValue([
        { roleEntity: { name: 'ADMIN' }, role: WorkspaceRole.ADMIN },
      ] as any);

      await expect(service.removeMember(wsId, userId)).rejects.toThrow(
        'Không thể xóa Quản trị viên duy nhất của Không gian làm việc!',
      );
    });
  });
});
