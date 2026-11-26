import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import {
  CreateWorkTypeDto,
  UpdateWorkTypeDto,
  DeleteWorkTypeDto,
  CreateStatusDto,
  UpdateStatusDto,
  DeleteStatusDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  UpdateWorkflowTransitionsDto,
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  UpdateProjectSettingsDto,
  CreateLabelDto,
  UpdateLabelDto,
} from './dto/project-config.dto.js';
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
   * POST /api/v1/projects/:projectId/statuses - Tạo cột Status mới
   */
  @Post(':projectId/statuses')
  @RequirePermission('PROJECT_CONFIGURE')
  @HttpCode(HttpStatus.CREATED)
  async createStatus(
    @Param('projectId') projectId: string,
    @Body() dto: CreateStatusDto,
  ) {
    return this.projectsService.createStatus(projectId, dto);
  }

  /**
   * PATCH /api/v1/projects/:projectId/statuses/:id - Cập nhật Status & WIP limit
   */
  @Patch(':projectId/statuses/:id')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateStatus(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.projectsService.updateStatus(projectId, id, dto);
  }

  /**
   * DELETE /api/v1/projects/:projectId/statuses/:id - Xóa cột Status (kèm fallbackStatusId)
   */
  @Delete(':projectId/statuses/:id')
  @RequirePermission('PROJECT_CONFIGURE')
  async deleteStatus(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() bodyDto?: DeleteStatusDto,
    @Query() queryDto?: DeleteStatusDto,
  ) {
    const dto = bodyDto?.fallbackStatusId ? bodyDto : queryDto;
    return this.projectsService.deleteStatus(projectId, id, dto);
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
   * POST /api/v1/projects/:projectId/work-types - Tạo mới WorkType
   */
  @Post(':projectId/work-types')
  @RequirePermission('PROJECT_CONFIGURE')
  @HttpCode(HttpStatus.CREATED)
  async createWorkType(
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkTypeDto,
  ) {
    return this.projectsService.createWorkType(projectId, dto);
  }

  /**
   * PATCH /api/v1/projects/:projectId/work-types/:id - Cập nhật WorkType
   */
  @Patch(':projectId/work-types/:id')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateWorkType(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkTypeDto,
  ) {
    return this.projectsService.updateWorkType(projectId, id, dto);
  }

  /**
   * DELETE /api/v1/projects/:projectId/work-types/:id - Xóa WorkType (kèm fallbackWorkTypeId)
   */
  @Delete(':projectId/work-types/:id')
  @RequirePermission('PROJECT_CONFIGURE')
  async deleteWorkType(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() bodyDto?: DeleteWorkTypeDto,
    @Query() queryDto?: DeleteWorkTypeDto,
  ) {
    const dto = bodyDto?.fallbackWorkTypeId ? bodyDto : queryDto;
    return this.projectsService.deleteWorkType(projectId, id, dto);
  }

  /**
   * GET /api/v1/projects/:projectId/workflows - Lấy danh sách Workflow kèm Transitions
   */
  @Get(':projectId/workflows')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getWorkflows(@Param('projectId') projectId: string) {
    return this.projectsService.getWorkflows(projectId);
  }

  /**
   * POST /api/v1/projects/:projectId/workflows - Tạo Workflow mới
   */
  @Post(':projectId/workflows')
  @RequirePermission('PROJECT_CONFIGURE')
  @HttpCode(HttpStatus.CREATED)
  async createWorkflow(
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.projectsService.createWorkflow(projectId, dto);
  }

  /**
   * PATCH /api/v1/projects/:projectId/workflows/:workflowId - Đổi tên Workflow
   */
  @Patch(':projectId/workflows/:workflowId')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateWorkflow(
    @Param('projectId') projectId: string,
    @Param('workflowId') workflowId: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.projectsService.updateWorkflow(projectId, workflowId, dto);
  }

  /**
   * DELETE /api/v1/projects/:projectId/workflows/:workflowId - Xóa Workflow
   */
  @Delete(':projectId/workflows/:workflowId')
  @RequirePermission('PROJECT_CONFIGURE')
  async deleteWorkflow(
    @Param('projectId') projectId: string,
    @Param('workflowId') workflowId: string,
  ) {
    return this.projectsService.deleteWorkflow(projectId, workflowId);
  }

  /**
   * PUT /api/v1/projects/:projectId/workflows/:workflowId/transitions - Cập nhật ma trận Transitions
   */
  @Put(':projectId/workflows/:workflowId/transitions')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateWorkflowTransitions(
    @Param('projectId') projectId: string,
    @Param('workflowId') workflowId: string,
    @Body() dto: UpdateWorkflowTransitionsDto,
  ) {
    return this.projectsService.updateWorkflowTransitions(projectId, workflowId, dto);
  }

  /**
   * GET /api/v1/projects/:projectId/custom-fields - Lấy danh sách Custom Fields
   */
  @Get(':projectId/custom-fields')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getCustomFields(@Param('projectId') projectId: string) {
    return this.projectsService.getCustomFields(projectId);
  }

  /**
   * POST /api/v1/projects/:projectId/custom-fields - Tạo mới Custom Field
   */
  @Post(':projectId/custom-fields')
  @RequirePermission('PROJECT_CONFIGURE')
  @HttpCode(HttpStatus.CREATED)
  async createCustomField(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCustomFieldDto,
  ) {
    return this.projectsService.createCustomField(projectId, dto);
  }

  /**
   * PATCH /api/v1/projects/:projectId/custom-fields/:id - Cập nhật Custom Field
   */
  @Patch(':projectId/custom-fields/:id')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateCustomField(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomFieldDto,
  ) {
    return this.projectsService.updateCustomField(projectId, id, dto);
  }

  /**
   * DELETE /api/v1/projects/:projectId/custom-fields/:id - Xóa Custom Field
   */
  @Delete(':projectId/custom-fields/:id')
  @RequirePermission('PROJECT_CONFIGURE')
  async deleteCustomField(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.deleteCustomField(projectId, id);
  }

  /**
   * GET /api/v1/projects/:projectId/labels - Lấy danh sách nhãn của dự án
   */
  @Get(':projectId/labels')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getLabels(@Param('projectId') projectId: string) {
    return this.projectsService.getLabels(projectId);
  }

  /**
   * POST /api/v1/projects/:projectId/labels - Tạo nhãn mới trong dự án
   */
  @Post(':projectId/labels')
  @RequirePermission('TASK_WRITE')
  @HttpCode(HttpStatus.CREATED)
  async createLabel(
    @Param('projectId') projectId: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.projectsService.createLabel(projectId, dto);
  }

  /**
   * PATCH /api/v1/projects/:projectId/labels/:labelId - Cập nhật nhãn
   */
  @Patch(':projectId/labels/:labelId')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateLabel(
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @Body() dto: UpdateLabelDto,
  ) {
    return this.projectsService.updateLabel(projectId, labelId, dto);
  }

  /**
   * DELETE /api/v1/projects/:projectId/labels/:labelId - Xóa nhãn
   */
  @Delete(':projectId/labels/:labelId')
  @RequirePermission('PROJECT_CONFIGURE')
  async deleteLabel(
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.projectsService.deleteLabel(projectId, labelId);
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
   * PATCH /api/v1/projects/:id/settings - Cập nhật cấu hình chung, views và chuyển đổi methodology
   */
  @Patch(':id/settings')
  @RequirePermission('PROJECT_CONFIGURE')
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectSettingsDto,
  ) {
    return this.projectsService.updateSettings(userId, id, dto);
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
