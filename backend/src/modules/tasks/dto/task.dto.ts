import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsUUID,
  IsArray,
  IsDateString,
} from 'class-validator';
import { TaskPriority } from '../entities/task.entity.js';

export interface TaskCustomFieldValueInput {
  customFieldId: string;
  value: any;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  sprintId?: string | null;

  @IsUUID()
  @IsOptional()
  typeId?: string;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsInt()
  @IsOptional()
  storyPoints?: number;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsUUID()
  @IsOptional()
  parentTaskId?: string;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsArray()
  @IsOptional()
  customFields?: TaskCustomFieldValueInput[];
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  sprintId?: string | null;

  @IsUUID()
  @IsOptional()
  typeId?: string;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsInt()
  @IsOptional()
  storyPoints?: number | null;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string | null;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsUUID()
  @IsOptional()
  parentTaskId?: string | null;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number | null;

  @IsDateString()
  @IsOptional()
  startDate?: string | null;

  @IsDateString()
  @IsOptional()
  dueDate?: string | null;

  @IsArray()
  @IsOptional()
  customFields?: TaskCustomFieldValueInput[];
}

export class MoveTaskDto {
  @IsUUID()
  @IsOptional()
  sprintId?: string | null;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsUUID()
  @IsOptional()
  toStatusId?: string;

  @IsInt()
  @IsOptional()
  position?: number;
}

export class TaskQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sprintId?: string;

  @IsOptional()
  isBacklog?: boolean | string;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsUUID()
  @IsOptional()
  workTypeId?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  sortBy?: 'position' | 'dueDate' | 'priority' | 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
