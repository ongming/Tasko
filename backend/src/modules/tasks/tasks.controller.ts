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
import { TasksService } from './tasks.service.js';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  TaskQueryDto,
} from './dto/task.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, RbacPermissionGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getTasks(
    @Param('projectId') projectId: string,
    @Query() queryOrSprintId?: TaskQueryDto | string,
    @Query('isBacklog') maybeIsBacklog?: string,
  ) {
    let query: TaskQueryDto;
    if (typeof queryOrSprintId === 'string' || maybeIsBacklog !== undefined) {
      query = {
        sprintId: typeof queryOrSprintId === 'string' ? queryOrSprintId : undefined,
        isBacklog: maybeIsBacklog,
      };
    } else {
      query = queryOrSprintId || {};
    }
    return this.tasksService.getTasks(projectId, query);
  }

  @Post()
  @RequirePermission('TASK_WRITE')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(userId, projectId, dto);
  }

  @Get(':taskId')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getTaskById(@Param('taskId') taskId: string) {
    return this.tasksService.getTaskById(taskId);
  }

  @Patch(':taskId')
  @RequirePermission('TASK_WRITE')
  async updateTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(userId, taskId, dto);
  }

  @Patch(':taskId/move')
  @RequirePermission('TASK_WRITE')
  async moveTask(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.moveTask(userId, projectId, taskId, dto);
  }

  @Delete(':taskId')
  @RequirePermission('TASK_WRITE')
  async deleteTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.deleteTask(userId, taskId);
  }
}
