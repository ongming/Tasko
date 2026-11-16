import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsUUID } from 'class-validator';
import { TaskPriority } from '../entities/task.entity.js';

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
}

export class MoveTaskDto {
  @IsUUID()
  @IsOptional()
  sprintId?: string | null;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsInt()
  @IsOptional()
  position?: number;
}
