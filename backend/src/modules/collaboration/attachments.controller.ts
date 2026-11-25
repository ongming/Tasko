import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AttachmentsService } from './attachments.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects/:projectId/tasks/:taskId/attachments')
@UseGuards(JwtAuthGuard, RbacPermissionGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  @RequirePermission('PROJECT_VIEW_ONLY')
  async findByTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.attachmentsService.findByTask(projectId, taskId);
  }

  @Post()
  @RequirePermission('COLLAB_AND_AI_USE')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.upload(projectId, taskId, userId, file);
  }

  @Delete(':attachmentId')
  @RequirePermission('COLLAB_AND_AI_USE')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.attachmentsService.remove(projectId, taskId, attachmentId, userId);
  }
}
