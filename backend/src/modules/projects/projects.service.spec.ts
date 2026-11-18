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
import { Project, ProjectMethodology } from './entities/project.entity.js';
import { Status, StatusCategory } from './entities/status.entity.js';
import { WorkType } from './entities/work-type.entity.js';
import { ProjectMember, ProjectRole } from './entities/project-member.entity.js';
import { Workflow } from './entities/workflow.entity.js';
import { WorkflowTransition } from './entities/workflow-transition.entity.js';
import { CustomField, CustomFieldType } from './entities/custom-field.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Workspace } from '../workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import { User } from '../auth/entities/user.entity.js';
import { Role, RoleScope } from '../rbac/entities/role.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { BadRequestException } from '@nestjs/common';

describe('ProjectsService - Unit Tests', () => {
  let service: ProjectsService;
  let projectRepo: Partial<Repository<Project>>;
  let statusRepo: Partial<Repository<Status>>;
  let workTypeRepo: Partial<Repository<WorkType>>;
  let projectMemberRepo: Partial<Repository<ProjectMember>>;
  let workspaceRepo: Partial<Repository<Workspace>>;
  let memberRepo: Partial<Repository<WorkspaceMember>>;
  let userRepo: Partial<Repository<User>>;
  let roleRepo: Partial<Repository<Role>>;
  let workflowRepo: Partial<Repository<Workflow>>;
  let workflowTransitionRepo: Partial<Repository<WorkflowTransition>>;
  let customFieldRepo: Partial<Repository<CustomField>>;
  let taskRepo: Partial<Repository<Task>>;
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
      remove: vi.fn(),
      softRemove: vi.fn(),
    };

    statusRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      count: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'status-mock-id' } as Status)),
      save: vi.fn(async (data: any) => ({ ...data, id: data.id || 'status-mock-id' })),
      remove: vi.fn(),
    };

    workTypeRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      count: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'wt-mock-id' } as WorkType)),
      save: vi.fn(async (data: any) => ({ ...data, id: data.id || 'wt-mock-id' })),
      remove: vi.fn(),
    };

    projectMemberRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'pm-id' })),
      save: vi.fn(async (data: any) => ({ ...data, id: data.id || 'pm-id' })),
      remove: vi.fn(),
    };

    workspaceRepo = {
      findOne: vi.fn(),
    };

    memberRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
    };

    userRepo = {
      findOne: vi.fn(),
    };

    roleRepo = {
      findOne: vi.fn(),
    };

    workflowRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'wf-mock-id' } as Workflow)),
      save: vi.fn(async (data: any) => ({ ...data, id: data.id || 'wf-mock-id' })),
      remove: vi.fn(),
    };

    workflowTransitionRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'wft-mock-id' } as WorkflowTransition)),
      save: vi.fn(async (data: any) => ({ ...data, id: data.id || 'wft-mock-id' })),
      remove: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    customFieldRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn((data: any) => ({ ...data, id: 'cf-mock-id' } as CustomField)),
      save: vi.fn(async (data: any) => ({ ...data, id: data.id || 'cf-mock-id' })),
      remove: vi.fn(),
    };

    taskRepo = {
      count: vi.fn().mockResolvedValue(0),
      update: vi.fn().mockResolvedValue(undefined),
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
        findOne: vi.fn().mockResolvedValue({ id: 'role-owner-id' }),
        update: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined),
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
        { provide: getRepositoryToken(Workflow), useValue: workflowRepo },
        { provide: getRepositoryToken(WorkflowTransition), useValue: workflowTransitionRepo },
        { provide: getRepositoryToken(CustomField), useValue: customFieldRepo },
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(Workspace), useValue: workspaceRepo },
        { provide: getRepositoryToken(WorkspaceMember), useValue: memberRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
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

  describe('delete', () => {
    it('ném lỗi NotFoundException nếu dự án không tồn tại', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue(null);
      await expect(service.delete(mockUserId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ném lỗi ForbiddenException nếu user không thuộc workspace', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({
        id: 'proj-1',
        workspace_id: mockWorkspaceId,
        owner_id: mockUserId,
      } as Project);
      vi.mocked(memberRepo.findOne!).mockResolvedValue(null);

      await expect(service.delete(mockUserId, 'proj-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('xóa dự án thành công khi user là chủ sở hữu dự án', async () => {
      const mockProj = {
        id: 'proj-1',
        workspace_id: mockWorkspaceId,
        owner_id: mockUserId,
      } as Project;
      vi.mocked(projectRepo.findOne!).mockResolvedValue(mockProj);
      vi.mocked(memberRepo.findOne!).mockResolvedValue({
        workspace_id: mockWorkspaceId,
        user_id: mockUserId,
        role: WorkspaceRole.MEMBER,
      } as WorkspaceMember);

      await service.delete(mockUserId, 'proj-1');
      expect(projectRepo.softRemove).toHaveBeenCalledWith(mockProj);
    });
  });

  describe('Quản lý thành viên Dự án & Chuyển quyền sở hữu', () => {
    const projId = 'proj-uuid-111';
    const targetUserId = 'target-user-222';
    const roleId = 'role-member-333';

    it('getProjectMembers: lấy danh sách thành viên dự án thành công', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({ id: projId, workspace_id: mockWorkspaceId } as Project);
      vi.mocked(projectMemberRepo.find!).mockResolvedValue([
        {
          id: 'pm-1',
          user_id: mockUserId,
          user: { id: mockUserId, email: 'owner@example.com', full_name: 'Owner', avatar_url: null },
          roleId: 'role-owner',
          roleEntity: { id: 'role-owner', name: 'OWNER' },
          role: ProjectRole.OWNER,
          joined_at: new Date(),
        } as any,
      ]);

      const res = await service.getProjectMembers(projId);
      expect(res).toHaveLength(1);
      expect(res[0].role.name).toBe('OWNER');
    });

    it('addProjectMember: thêm thành viên vào dự án thành công khi đã thuộc Workspace', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({ id: projId, workspace_id: mockWorkspaceId } as Project);
      vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: roleId, name: 'MEMBER', scope: RoleScope.PROJECT } as Role);
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: targetUserId, email: 'member@example.com' } as User);
      vi.mocked(memberRepo.findOne!).mockResolvedValue({ id: 'ws-mem-1' } as any); // Đã thuộc workspace
      vi.mocked(projectMemberRepo.findOne!).mockResolvedValue(null); // Chưa thuộc project

      const res = await service.addProjectMember(projId, { userId: targetUserId, roleId });
      expect(res.userId).toBe(targetUserId);
      expect(projectMemberRepo.save).toHaveBeenCalled();
    });

    it('addProjectMember: ném BadRequestException khi người dùng chưa thuộc Workspace', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({ id: projId, workspace_id: mockWorkspaceId } as Project);
      vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: roleId, name: 'MEMBER', scope: RoleScope.PROJECT } as Role);
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: targetUserId, email: 'outsider@example.com' } as User);
      vi.mocked(memberRepo.findOne!).mockResolvedValue(null); // Chưa thuộc workspace!

      await expect(
        service.addProjectMember(projId, { userId: targetUserId, roleId }),
      ).rejects.toThrow('Người dùng phải là thành viên của Không gian làm việc trước khi thêm vào Dự án!');
    });

    it('updateProjectMemberRole: chặn đổi sang role OWNER qua API này', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({ id: projId, owner_id: mockUserId } as Project);
      vi.mocked(projectMemberRepo.findOne!).mockResolvedValue({
        id: 'pm-1',
        project_id: projId,
        user_id: targetUserId,
        role: ProjectRole.MEMBER,
      } as any);
      vi.mocked(roleRepo.findOne!).mockResolvedValue({ id: 'owner-role-id', name: 'OWNER', scope: RoleScope.PROJECT } as Role);

      await expect(
        service.updateProjectMemberRole(projId, targetUserId, { roleId: 'owner-role-id' }),
      ).rejects.toThrow('Không thể gán vai trò Chủ sở hữu qua API này');
    });

    it('removeProjectMember: chặn xóa OWNER khỏi dự án', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({ id: projId, owner_id: mockUserId } as Project);
      vi.mocked(projectMemberRepo.findOne!).mockResolvedValue({
        id: 'pm-owner',
        project_id: projId,
        user_id: mockUserId,
        role: ProjectRole.OWNER,
      } as any);

      await expect(service.removeProjectMember(projId, mockUserId)).rejects.toThrow(
        'Không thể xóa Chủ sở hữu khỏi dự án. Vui lòng chuyển quyền sở hữu trước!',
      );
    });

    it('transferOwnership: chuyển quyền sở hữu thành công trong Transaction', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({ id: projId, owner_id: mockUserId } as Project);
      vi.mocked(projectMemberRepo.findOne!).mockResolvedValue({
        id: 'pm-target',
        project_id: projId,
        user_id: targetUserId,
      } as any);

      const res = await service.transferOwnership(mockUserId, projId, { targetUserId });
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.update).toHaveBeenCalledTimes(3);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(res.success).toBe(true);
    });

    it('transferOwnership: ném BadRequestException nếu targetUserId chưa là thành viên dự án', async () => {
      vi.mocked(projectRepo.findOne!).mockResolvedValue({ id: projId, owner_id: mockUserId } as Project);
      vi.mocked(projectMemberRepo.findOne!).mockResolvedValue(null);

      await expect(
        service.transferOwnership(mockUserId, projId, { targetUserId }),
      ).rejects.toThrow('Người nhận chuyển giao quyền sở hữu phải là thành viên của dự án!');
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

  // =========================================================
  // 12. DYNAMIC WORKFLOW & CONFIG TESTS
  // =========================================================
  describe('WorkType Management', () => {
    it('tạo WorkType thành công', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      workTypeRepo.save = vi.fn().mockResolvedValue({ id: 'wt-1', name: 'Hotfix' } as WorkType);

      const result = await service.createWorkType('proj-1', { name: 'Hotfix' });
      expect(result.name).toBe('Hotfix');
    });

    it('xóa WorkType ném BadRequestException nếu đang có task mà thiếu fallbackId', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      workTypeRepo.findOne = vi.fn().mockResolvedValue({ id: 'wt-1' });
      taskRepo.count = vi.fn().mockResolvedValue(5);

      await expect(service.deleteWorkType('proj-1', 'wt-1')).rejects.toThrow(BadRequestException);
    });

    it('xóa WorkType thành công khi có fallbackId hợp lệ', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      workTypeRepo.findOne = vi.fn().mockImplementation(async ({ where }: any) => {
        if (where.id === 'wt-1') return { id: 'wt-1' } as WorkType;
        if (where.id === 'wt-fallback') return { id: 'wt-fallback' } as WorkType;
        return null;
      });
      taskRepo.count = vi.fn().mockResolvedValue(5);

      const result = await service.deleteWorkType('proj-1', 'wt-1', { fallbackWorkTypeId: 'wt-fallback' });
      expect(result.success).toBe(true);
    });
  });

  describe('Status Management & WIP Limit', () => {
    it('tạo Status ném BadRequestException nếu wipLimit < 1', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      await expect(
        service.createStatus('proj-1', {
          name: 'Review',
          category: StatusCategory.IN_PROGRESS,
          wipLimit: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('xóa Status ném BadRequestException nếu có Task mà không có fallbackStatusId', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      statusRepo.findOne = vi.fn().mockResolvedValue({ id: 'st-1' });
      taskRepo.count = vi.fn().mockResolvedValue(2);

      await expect(service.deleteStatus('proj-1', 'st-1')).rejects.toThrow(BadRequestException);
    });

    it('xóa Status thành công và chuyển Task sang fallbackStatusId', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      statusRepo.findOne = vi.fn().mockImplementation(async ({ where }: any) => {
        if (where.id === 'st-1') return { id: 'st-1' } as Status;
        if (where.id === 'st-fallback') return { id: 'st-fallback' } as Status;
        return null;
      });
      taskRepo.count = vi.fn().mockResolvedValue(2);

      const result = await service.deleteStatus('proj-1', 'st-1', { fallbackStatusId: 'st-fallback' });
      expect(result.success).toBe(true);
    });
  });

  describe('Workflow & Transitions', () => {
    it('cập nhật transitions ném BadRequestException nếu fromStatus === toStatus', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      workflowRepo.findOne = vi.fn().mockResolvedValue({ id: 'wf-1' });
      statusRepo.find = vi.fn().mockResolvedValue([{ id: 'st-1' }]);

      await expect(
        service.updateWorkflowTransitions('proj-1', 'wf-1', {
          transitions: [{ fromStatusId: 'st-1', toStatusId: 'st-1' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('cập nhật transitions thành công khi dữ liệu hợp lệ', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      workflowRepo.findOne = vi.fn().mockResolvedValue({ id: 'wf-1' });
      statusRepo.find = vi.fn().mockResolvedValue([{ id: 'st-1' }, { id: 'st-2' }]);
      workflowTransitionRepo.find = vi.fn().mockResolvedValue([
        { id: 'wft-1', fromStatusId: 'st-1', toStatusId: 'st-2' },
      ]);

      const result = await service.updateWorkflowTransitions('proj-1', 'wf-1', {
        transitions: [{ fromStatusId: 'st-1', toStatusId: 'st-2' }],
      });
      expect(result.length).toBe(1);
    });
  });

  describe('CustomField Management', () => {
    it('tạo CustomField SELECT ném BadRequestException nếu thiếu options', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });

      await expect(
        service.createCustomField('proj-1', {
          name: 'Priority Level',
          fieldType: CustomFieldType.SELECT,
          options: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('tạo CustomField thành công khi hợp lệ', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({ id: 'proj-1' });
      customFieldRepo.save = vi.fn().mockResolvedValue({
        id: 'cf-1',
        name: 'Sprint Goal',
        fieldType: CustomFieldType.TEXT,
      } as CustomField);

      const result = await service.createCustomField('proj-1', {
        name: 'Sprint Goal',
        fieldType: CustomFieldType.TEXT,
      });
      expect(result.name).toBe('Sprint Goal');
    });
  });

  describe('Update Settings & Methodology', () => {
    it('chuyển đổi methodology và cập nhật settings thành công', async () => {
      projectRepo.findOne = vi.fn().mockResolvedValue({
        id: 'proj-1',
        workspace_id: mockWorkspaceId,
        settings: {},
      });
      memberRepo.findOne = vi.fn().mockResolvedValue({ user_id: mockUserId, workspace_id: mockWorkspaceId });
      projectRepo.save = vi.fn().mockImplementation(async (p) => p);

      const result = await service.updateSettings(mockUserId, 'proj-1', {
        methodology: ProjectMethodology.SCRUM,
        settings: { views: ['control', 'board', 'backlog'] },
      });

      expect(result.methodology).toBe(ProjectMethodology.SCRUM);
      expect(result.settings?.views).toContain('backlog');
    });
  });
});
