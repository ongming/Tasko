import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity.js';
import { CustomFieldValue } from './entities/custom-field-value.entity.js';
import { Status } from '../projects/entities/status.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { CustomField } from '../projects/entities/custom-field.entity.js';
import { WorkflowTransition } from '../projects/entities/workflow-transition.entity.js';
import { Workflow } from '../projects/entities/workflow.entity.js';
import { Label } from '../projects/entities/label.entity.js';
import { TaskLabel } from '../projects/entities/task-label.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      CustomFieldValue,
      Status,
      WorkType,
      Project,
      CustomField,
      WorkflowTransition,
      Workflow,
      Label,
      TaskLabel,
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
