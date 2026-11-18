import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RbacPermissionGuard } from './rbac-permission.guard.js';
import { Project } from '../../modules/projects/entities/project.entity.js';
import { WorkspaceMember } from '../../modules/workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../../modules/workspaces/enums/workspace-role.enum.js';
import { ProjectMember } from '../../modules/projects/entities/project-member.entity.js';

describe('RbacPermissionGuard - Unit Tests', () => {
  let guard: RbacPermissionGuard;
  let reflector: Reflector;
  let projectRepo: any;
  let wsMemberRepo: any;
  let projMemberRepo: any;

  const mockUserId = 'user-uuid-111';
  const mockWsId = 'ws-uuid-222';
  const mockProjectId = 'proj-uuid-333';

  const createMockContext = (
    user: any,
    params: any = {},
    body: any = {},
    query: any = {},
    baseUrl: string = '/api/projects',
  ): ExecutionContext => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          user,
          params,
          body,
          query,
          baseUrl,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    projectRepo = {
      findOne: vi.fn(),
    };
    wsMemberRepo = {
      findOne: vi.fn(),
    };
    projMemberRepo = {
      findOne: vi.fn(),
    };

    const mockDataSource = {
      getRepository: vi.fn((entity: any) => {
        if (entity === Project) return projectRepo;
        if (entity === WorkspaceMember) return wsMemberRepo;
        if (entity === ProjectMember) return projMemberRepo;
        return { findOne: vi.fn() };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacPermissionGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: vi.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    guard = module.get<RbacPermissionGuard>(RbacPermissionGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('cho phép đi qua khi route không gắn @RequirePermission()', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);
    const ctx = createMockContext({ id: mockUserId });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('ném ForbiddenException khi không có user đăng nhập', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['PROJECT_VIEW_ONLY']);
    const ctx = createMockContext(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  describe('Ngữ cảnh Workspace', () => {
    it('cho phép Workspace OWNER hoặc user có quyền WORKSPACE_ADMIN đi qua', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['WORKSPACE_MEMBER_MANAGE']);
      const ctx = createMockContext({ id: mockUserId }, { wsId: mockWsId });

      wsMemberRepo.findOne.mockResolvedValue({
        workspace_id: mockWsId,
        user_id: mockUserId,
        role: WorkspaceRole.OWNER,
        roleEntity: null,
      });

      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
    });

    it('cho phép thành viên có đủ quyền yêu cầu đi qua', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['WORKSPACE_PROJECT_VIEW']);
      const ctx = createMockContext({ id: mockUserId }, { wsId: mockWsId });

      wsMemberRepo.findOne.mockResolvedValue({
        workspace_id: mockWsId,
        user_id: mockUserId,
        role: WorkspaceRole.MEMBER,
        roleEntity: {
          rolePermissions: [{ permission: { code: 'WORKSPACE_PROJECT_VIEW' } }],
        },
      });

      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
    });

    it('ném ForbiddenException khi thành viên thiếu quyền trong Workspace', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['WORKSPACE_MEMBER_MANAGE']);
      const ctx = createMockContext({ id: mockUserId }, { wsId: mockWsId });

      wsMemberRepo.findOne.mockResolvedValue({
        workspace_id: mockWsId,
        user_id: mockUserId,
        role: WorkspaceRole.MEMBER,
        roleEntity: {
          rolePermissions: [{ permission: { code: 'WORKSPACE_PROJECT_VIEW' } }],
        },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Ngữ cảnh Project', () => {
    beforeEach(() => {
      projectRepo.findOne.mockResolvedValue({
        id: mockProjectId,
        key: 'PROJ',
        workspace_id: mockWsId,
      });
    });

    it('ném NotFoundException khi không tìm thấy dự án', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['PROJECT_VIEW_ONLY']);
      projectRepo.findOne.mockResolvedValue(null);
      const ctx = createMockContext({ id: mockUserId }, { projectId: 'non-existent-proj' });

      await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
    });

    it('Workspace ADMIN có quyền vượt cấp (toàn quyền) trên mọi dự án thuộc Workspace', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['PROJECT_MANAGE']);
      const ctx = createMockContext({ id: mockUserId }, { projectId: mockProjectId });

      // User là Workspace Admin (có WORKSPACE_ADMIN)
      wsMemberRepo.findOne.mockResolvedValue({
        workspace_id: mockWsId,
        user_id: mockUserId,
        role: WorkspaceRole.ADMIN,
        roleEntity: {
          rolePermissions: [{ permission: { code: 'WORKSPACE_ADMIN' } }],
        },
      });

      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
      // Không cần kiểm tra ProjectMember
      expect(projMemberRepo.findOne).not.toHaveBeenCalled();
    });

    it('cho phép Project Member có đúng quyền được đi qua', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['TASK_WRITE']);
      const ctx = createMockContext({ id: mockUserId }, { projectId: mockProjectId });

      wsMemberRepo.findOne.mockResolvedValue({
        workspace_id: mockWsId,
        user_id: mockUserId,
        role: WorkspaceRole.MEMBER,
        roleEntity: {
          rolePermissions: [{ permission: { code: 'WORKSPACE_PROJECT_VIEW' } }],
        },
      });

      projMemberRepo.findOne.mockResolvedValue({
        project_id: mockProjectId,
        user_id: mockUserId,
        roleEntity: {
          rolePermissions: [{ permission: { code: 'TASK_WRITE' } }],
        },
      });

      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
    });

    it('ném ForbiddenException khi Project Member thiếu quyền (ví dụ MEMBER gọi PROJECT_MANAGE)', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['PROJECT_MANAGE']);
      const ctx = createMockContext({ id: mockUserId }, { projectId: mockProjectId });

      wsMemberRepo.findOne.mockResolvedValue({
        workspace_id: mockWsId,
        user_id: mockUserId,
        role: WorkspaceRole.MEMBER,
        roleEntity: null,
      });

      projMemberRepo.findOne.mockResolvedValue({
        project_id: mockProjectId,
        user_id: mockUserId,
        roleEntity: {
          rolePermissions: [
            { permission: { code: 'TASK_WRITE' } },
            { permission: { code: 'PROJECT_VIEW_ONLY' } },
          ],
        },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });

    it('ném ForbiddenException khi user không phải thành viên của dự án', async () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['PROJECT_VIEW_ONLY']);
      const ctx = createMockContext({ id: mockUserId }, { projectId: mockProjectId });

      wsMemberRepo.findOne.mockResolvedValue({
        workspace_id: mockWsId,
        user_id: mockUserId,
        role: WorkspaceRole.MEMBER,
        roleEntity: null,
      });

      projMemberRepo.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });
  });
});
