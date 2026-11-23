import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority } from '../../tasks/entities/task.entity.js';

export class SuggestedTaskItemDto {
  @IsString({ message: 'tempId phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tempId không được để trống' })
  @MaxLength(100)
  tempId: string;

  @IsBoolean({ message: 'selected phải là giá trị boolean' })
  selected: boolean;

  @IsString({ message: 'Tiêu đề công việc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  @MaxLength(255, { message: 'Tiêu đề công việc tối đa 255 ký tự' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Mô tả công việc phải là chuỗi ký tự' })
  description?: string;

  @IsEnum(TaskPriority, {
    message: 'Độ ưu tiên phải thuộc một trong: LOW, MEDIUM, HIGH, URGENT',
  })
  priority: TaskPriority;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber({}, { message: 'storyPoints phải là số' })
  @Min(0, { message: 'storyPoints phải lớn hơn hoặc bằng 0' })
  storyPoints?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber({}, { message: 'estimatedHours phải là số' })
  @Min(0, { message: 'estimatedHours phải lớn hơn hoặc bằng 0' })
  estimatedHours?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4', { message: 'assigneeId phải là UUID hợp lệ' })
  assigneeId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4', { message: 'workTypeId phải là UUID hợp lệ' })
  workTypeId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4', { message: 'sprintId phải là UUID hợp lệ' })
  sprintId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsISO8601({}, { message: 'startDate phải là chuỗi ngày ISO hợp lệ' })
  startDate?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsISO8601({}, { message: 'dueDate phải là chuỗi ngày ISO hợp lệ' })
  dueDate?: string | null;
}

export class UpdateSuggestedTasksDto {
  @IsArray({ message: 'suggestedTasks phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => SuggestedTaskItemDto)
  suggestedTasks: SuggestedTaskItemDto[];
}
