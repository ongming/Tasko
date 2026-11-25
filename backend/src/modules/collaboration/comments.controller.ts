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
import { CommentsService } from './comments.service.js';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from './dto/task-comment.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects/:projectId/tasks/:taskId/comments')
@UseGuards(JwtAuthGuard, RbacPermissionGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @RequirePermission('PROJECT_VIEW_ONLY')
  async findByTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.commentsService.findByTask(projectId, taskId);
  }

  @Post()
  @RequirePermission('COLLAB_AND_AI_USE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.commentsService.create(projectId, taskId, userId, dto);
  }

  @Patch(':commentId')
  @RequirePermission('COLLAB_AND_AI_USE')
  async update(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateTaskCommentDto,
  ) {
    return this.commentsService.update(projectId, taskId, commentId, userId, dto);
  }

  @Delete(':commentId')
  @RequirePermission('COLLAB_AND_AI_USE')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.remove(projectId, taskId, commentId, userId);
  }
}
