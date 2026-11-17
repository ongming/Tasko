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
  CreateSprintDto,
  UpdateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from './dto/sprint.dto.js';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
} from './dto/task.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects')
@UseGuards(JwtAuthGuard)
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
  async getWorkTypes(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.findWorkTypesByProject(userId, id);
  }

  /**
   * ==========================================
   * SPRINTS ENDPOINTS (SCRUM)
   * ==========================================
   */

  @Get(':id/sprints')
  async getSprints(@Param('id') id: string) {
    return this.projectsService.getSprints(id);
  }

  @Post(':id/sprints')
  @HttpCode(HttpStatus.CREATED)
  async createSprint(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.projectsService.createSprint(userId, id, dto);
  }

  @Patch(':id/sprints/:sprintId')
  async updateSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.projectsService.updateSprint(userId, sprintId, dto);
  }

  @Post(':id/sprints/:sprintId/start')
  async startSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: StartSprintDto,
  ) {
    return this.projectsService.startSprint(userId, sprintId, dto);
  }

  @Post(':id/sprints/:sprintId/complete')
  async completeSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: CompleteSprintDto,
  ) {
    return this.projectsService.completeSprint(userId, sprintId, dto);
  }

  @Delete(':id/sprints/:sprintId')
  async deleteSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.projectsService.deleteSprint(userId, sprintId);
  }

  /**
   * ==========================================
   * TASKS / ISSUES ENDPOINTS
   * ==========================================
   */

  @Get(':id/tasks')
  async getTasks(
    @Param('id') id: string,
    @Query('sprintId') sprintId?: string,
    @Query('isBacklog') isBacklog?: string,
  ) {
    return this.projectsService.getTasks(id, { sprintId, isBacklog });
  }

  @Post(':id/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.projectsService.createTask(userId, id, dto);
  }

  @Get(':id/tasks/:taskId')
  async getTaskById(@Param('taskId') taskId: string) {
    return this.projectsService.getTaskById(taskId);
  }

  @Patch(':id/tasks/:taskId')
  async updateTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.projectsService.updateTask(userId, taskId, dto);
  }

  @Patch(':id/tasks/:taskId/move')
  async moveTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.projectsService.moveTask(userId, taskId, dto);
  }

  @Delete(':id/tasks/:taskId')
  async deleteTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.projectsService.deleteTask(userId, taskId);
  }

  /**
   * PATCH /api/v1/projects/:id/settings - Cập nhật cấu hình dự án (ví dụ views, tabs)
   */
  @Patch(':id/settings')
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() settings: Record<string, any>,
  ) {
    return this.projectsService.updateSettings(userId, id, settings);
  }

  /**
   * DELETE /api/v1/projects/:id - Xóa một dự án (theo ID hoặc Key)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.projectsService.delete(userId, id);
    return { success: true, message: 'Đã xóa dự án thành công!' };
  }
}
