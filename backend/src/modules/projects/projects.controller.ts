import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import {
  AddProjectMemberDto,
  UpdateProjectMemberRoleDto,
  TransferOwnershipDto,
} from './dto/project-member.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects')
@UseGuards(JwtAuthGuard, RbacPermissionGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * POST /api/v1/projects - Khởi tạo dự án mới trong Workspace
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, createProjectDto);
  }

  /**
   * GET /api/v1/projects?workspaceId=... - Lấy danh sách dự án
   */
  @Get()
  @RequirePermission('WORKSPACE_PROJECT_VIEW')
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.projectsService.findAllByWorkspace(userId, workspaceId);
  }

  /**
   * GET /api/v1/projects/:id - Lấy chi tiết dự án theo ID hoặc Key
   */
  @Get(':id')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.findById(userId, id);
  }

  /**
   * GET /api/v1/projects/:id/statuses - Lấy danh sách cột Status của dự án (theo ID hoặc Key)
   */
  @Get(':id/statuses')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getStatuses(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.findStatusesByProject(userId, id);
  }

  /**
   * GET /api/v1/projects/:id/work-types - Lấy danh sách WorkType của dự án (theo ID hoặc Key)
   */
  @Get(':id/work-types')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getWorkTypes(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.findWorkTypesByProject(userId, id);
  }

  /**
   * GET /api/v1/projects/:projectId/members - Lấy danh sách thành viên Dự án
   */
  @Get(':projectId/members')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getMembers(@Param('projectId') projectId: string) {
    return this.projectsService.getProjectMembers(projectId);
  }

  /**
   * POST /api/v1/projects/:projectId/members - Thêm thành viên vào Dự án
   */
  @Post(':projectId/members')
  @RequirePermission('PROJECT_MANAGE')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projectsService.addProjectMember(projectId, dto);
  }

  /**
   * PATCH /api/v1/projects/:projectId/members/:userId/role - Thay đổi vai trò thành viên Dự án
   */
  @Patch(':projectId/members/:userId/role')
  @RequirePermission('PROJECT_MANAGE')
  async updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
  ) {
    return this.projectsService.updateProjectMemberRole(projectId, targetUserId, dto);
  }

  /**
   * DELETE /api/v1/projects/:projectId/members/:userId - Xóa thành viên khỏi Dự án
   */
  @Delete(':projectId/members/:userId')
  @RequirePermission('PROJECT_MANAGE')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.projectsService.removeProjectMember(projectId, targetUserId);
  }

  /**
   * PATCH /api/v1/projects/:projectId/transfer-ownership - Chuyển quyền sở hữu Dự án
   */
  @Patch(':projectId/transfer-ownership')
  @RequirePermission('PROJECT_MANAGE')
  async transferOwnership(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.projectsService.transferOwnership(userId, projectId, dto);
  }

  /**
   * PATCH /api/v1/projects/:id/settings - Cập nhật cấu hình dự án (ví dụ views, tabs)
   */
  @Patch(':id/settings')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() settings: Record<string, any>,
  ) {
    return this.projectsService.updateSettings(userId, id, settings);
  }

  /**
   * DELETE /api/v1/projects/:id - Xóa mềm một dự án (theo ID hoặc Key)
   */
  @Delete(':id')
  @RequirePermission('PROJECT_MANAGE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.projectsService.delete(userId, id);
    return { success: true, message: 'Đã xóa dự án thành công!' };
  }
}
