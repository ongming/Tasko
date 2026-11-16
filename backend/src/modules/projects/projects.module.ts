import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity.js';
import { Status } from './entities/status.entity.js';
import { WorkType } from './entities/work-type.entity.js';
import { ProjectMember } from './entities/project-member.entity.js';
import { Sprint } from './entities/sprint.entity.js';
import { Task } from './entities/task.entity.js';
import { Workspace } from '../workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Status,
      WorkType,
      ProjectMember,
      Sprint,
      Task,
      Workspace,
      WorkspaceMember,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
