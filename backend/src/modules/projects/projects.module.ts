import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity.js';
import { Status } from './entities/status.entity.js';
import { WorkType } from './entities/work-type.entity.js';
import { ProjectMember } from './entities/project-member.entity.js';
import { Workflow } from './entities/workflow.entity.js';
import { WorkflowTransition } from './entities/workflow-transition.entity.js';
import { CustomField } from './entities/custom-field.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { Workspace } from '../workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { User } from '../auth/entities/user.entity.js';
import { Role } from '../rbac/entities/role.entity.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Status,
      WorkType,
      ProjectMember,
      Workflow,
      WorkflowTransition,
      CustomField,
      Task,
      Workspace,
      WorkspaceMember,
      User,
      Role,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}
