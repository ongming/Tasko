import {
  IsArray,
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SuggestedTaskItemDto } from './update-suggested-tasks.dto.js';

export class ConfirmAiTasksDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4', { message: 'defaultSprintId phải là UUID hợp lệ' })
  defaultSprintId?: string | null;

  @IsOptional()
  @IsArray({ message: 'tasks phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => SuggestedTaskItemDto)
  tasks?: SuggestedTaskItemDto[];
}
