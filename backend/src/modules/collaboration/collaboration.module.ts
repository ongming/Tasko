import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskComment } from './entities/task-comment.entity.js';
import { TaskAttachment } from './entities/task-attachment.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { ProjectMember } from '../projects/entities/project-member.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { AttachmentsController } from './attachments.controller.js';
import { AttachmentsService } from './attachments.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskComment,
      TaskAttachment,
      Task,
      Project,
      ProjectMember,
      WorkspaceMember,
    ]),
    CloudinaryModule,
  ],
  controllers: [CommentsController, AttachmentsController],
  providers: [CommentsService, AttachmentsService],
  exports: [CommentsService, AttachmentsService],
})
export class CollaborationModule {}
