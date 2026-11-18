import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import {
  AddWorkspaceMemberDto,
  UpdateWorkspaceMemberRoleDto,
} from './dto/workspace-member.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, RbacPermissionGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  /**
   * POST /api/v1/workspaces - Tạo không gian làm việc mới
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(userId, createWorkspaceDto);
  }

  /**
   * GET /api/v1/workspaces - Lấy danh sách workspace của user hiện tại
   */
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.workspacesService.findAllByUser(userId);
  }

  /**
   * GET /api/v1/workspaces/:slug - Lấy thông tin chi tiết workspace theo slug
   */
  @Get(':slug')
  @RequirePermission('WORKSPACE_PROJECT_VIEW')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('slug') slug: string,
  ) {
    return this.workspacesService.findBySlug(userId, slug);
  }

  /**
   * GET /api/v1/workspaces/:wsId/members - Lấy danh sách thành viên Workspace
   */
  @Get(':wsId/members')
  @RequirePermission('WORKSPACE_PROJECT_VIEW')
  async getMembers(@Param('wsId') wsId: string) {
    return this.workspacesService.getMembers(wsId);
  }

  /**
   * POST /api/v1/workspaces/:wsId/members - Thêm thành viên mới vào Workspace
   */
  @Post(':wsId/members')
  @RequirePermission('WORKSPACE_MEMBER_MANAGE')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('wsId') wsId: string,
    @Body() dto: AddWorkspaceMemberDto,
  ) {
    return this.workspacesService.addMember(wsId, dto);
  }

  /**
   * PATCH /api/v1/workspaces/:wsId/members/:userId/role - Thay đổi vai trò thành viên
   */
  @Patch(':wsId/members/:userId/role')
  @RequirePermission('WORKSPACE_MEMBER_MANAGE')
  async updateMemberRole(
    @Param('wsId') wsId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateWorkspaceMemberRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(wsId, targetUserId, dto);
  }

  /**
   * DELETE /api/v1/workspaces/:wsId/members/:userId - Xóa thành viên khỏi Workspace
   */
  @Delete(':wsId/members/:userId')
  @RequirePermission('WORKSPACE_MEMBER_MANAGE')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('wsId') wsId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.workspacesService.removeMember(wsId, targetUserId);
  }
}
