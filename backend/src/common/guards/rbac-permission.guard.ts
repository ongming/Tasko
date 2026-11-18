import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator.js';
import { Project } from '../../modules/projects/entities/project.entity.js';
import { Workspace } from '../../modules/workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../../modules/workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../../modules/workspaces/enums/workspace-role.enum.js';
import { ProjectMember } from '../../modules/projects/entities/project-member.entity.js';
import { Sprint } from '../../modules/sprints/entities/sprint.entity.js';
import { Task } from '../../modules/tasks/entities/task.entity.js';

@Injectable()
export class RbacPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  private isUuid(val: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) {
      throw new ForbiddenException('Yêu cầu xác thực người dùng!');
    }

    const params = request.params || {};
    const body = request.body || {};
    const query = request.query || {};

    // 1. Tìm định danh Project (nếu có)
    let projectIdentifier: string | null =
      params.projectId ||
      (params.id && request.baseUrl?.includes('projects') ? params.id : null) ||
      body.projectId ||
      null;

    // Nếu không có projectId nhưng có sprintId
    if (!projectIdentifier && params.sprintId) {
      const sprint = await this.dataSource.getRepository(Sprint).findOne({
        where: { id: params.sprintId },
      });
      if (sprint) {
        projectIdentifier = sprint.project_id;
      }
    }

    // Nếu không có projectId nhưng có taskId
    if (!projectIdentifier && params.taskId) {
      const task = await this.dataSource.getRepository(Task).findOne({
        where: { id: params.taskId },
      });
      if (task) {
        projectIdentifier = task.project_id;
      }
    }

    // =========================================================================
    // NGỮ CẢNH PROJECT
    // =========================================================================
    if (projectIdentifier) {
      const projectRepo = this.dataSource.getRepository(Project);
      let project: Project | null = null;

      if (this.isUuid(projectIdentifier)) {
        project = await projectRepo.findOne({ where: { id: projectIdentifier } });
      } else {
        project = await projectRepo.findOne({
          where: { key: projectIdentifier.toUpperCase() },
        });
      }

      if (!project) {
        throw new NotFoundException('Dự án không tồn tại!');
      }

      // 1.1. Kiểm tra Workspace ADMIN
      const wsMember = await this.dataSource.getRepository(WorkspaceMember).findOne({
        where: { workspace_id: project.workspace_id, user_id: user.id },
        relations: {
          roleEntity: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      });

      if (wsMember) {
        const isWsOwner = wsMember.role === WorkspaceRole.OWNER;
        const hasWsAdminPerm = wsMember.roleEntity?.rolePermissions?.some(
          (rp) => rp.permission?.code === 'WORKSPACE_ADMIN',
        );

        // Workspace ADMIN có toàn quyền thực thi trên mọi dự án thuộc Workspace
        if (isWsOwner || hasWsAdminPerm) {
          return true;
        }
      }

      // 1.2. Nếu không phải Workspace ADMIN, kiểm tra trong ProjectMember
      const projMember = await this.dataSource.getRepository(ProjectMember).findOne({
        where: { project_id: project.id, user_id: user.id },
        relations: {
          roleEntity: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      });

      if (!projMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của dự án này!');
      }

      const userPerms =
        projMember.roleEntity?.rolePermissions
          ?.map((rp) => rp.permission?.code)
          .filter((code): code is string => Boolean(code)) || [];

      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPerms.includes(perm),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này trên dự án!');
      }

      return true;
    }

    // =========================================================================
    // NGỮ CẢNH WORKSPACE
    // =========================================================================
    let workspaceId: string | null =
      params.wsId ||
      params.workspaceId ||
      (params.id && request.baseUrl?.includes('workspaces') ? params.id : null) ||
      body.workspaceId ||
      query.workspaceId ||
      null;

    // Nếu route truyền slug thay vì UUID
    if (!workspaceId && params.slug) {
      const ws = await this.dataSource.getRepository(Workspace).findOne({
        where: { slug: params.slug.toLowerCase().trim() },
      });
      if (ws) workspaceId = ws.id;
    } else if (workspaceId && !this.isUuid(workspaceId)) {
      const ws = await this.dataSource.getRepository(Workspace).findOne({
        where: { slug: workspaceId.toLowerCase().trim() },
      });
      if (ws) workspaceId = ws.id;
    }

    if (workspaceId) {
      const wsMember = await this.dataSource.getRepository(WorkspaceMember).findOne({
        where: { workspace_id: workspaceId, user_id: user.id },
        relations: {
          roleEntity: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      });

      if (!wsMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của không gian làm việc này!');
      }

      const isWsOwner = wsMember.role === WorkspaceRole.OWNER;
      const hasWsAdminPerm = wsMember.roleEntity?.rolePermissions?.some(
        (rp) => rp.permission?.code === 'WORKSPACE_ADMIN',
      );

      if (isWsOwner || hasWsAdminPerm) {
        return true;
      }

      const userPerms =
        wsMember.roleEntity?.rolePermissions
          ?.map((rp) => rp.permission?.code)
          .filter((code): code is string => Boolean(code)) || [];

      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPerms.includes(perm),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này trên không gian làm việc!');
      }

      return true;
    }

    // Route không có projectIdentifier lẫn workspaceId (ví dụ list workspace cá nhân)
    return true;
  }
}
