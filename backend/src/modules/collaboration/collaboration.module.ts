import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskComment } from './entities/task-comment.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { ProjectMember } from '../projects/entities/project-member.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskComment,
      Task,
      Project,
      ProjectMember,
      WorkspaceMember,
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CollaborationModule {}
