import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsUUID,
  IsBoolean,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatusCategory } from '../entities/status.entity.js';
import { CustomFieldType } from '../entities/custom-field.entity.js';
import { ProjectMethodology } from '../entities/project.entity.js';

// ==========================================
// 1. WORK TYPES DTO
// ==========================================
export class CreateWorkTypeDto {
  @IsString({ message: 'Tên loại công việc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên loại công việc không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isSubtask?: boolean;

  @IsUUID('all', { message: 'workflowId không hợp lệ' })
  @IsOptional()
  workflowId?: string;
}

export class UpdateWorkTypeDto {
  @IsString({ message: 'Tên loại công việc phải là chuỗi ký tự' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isSubtask?: boolean;

  @IsUUID('all', { message: 'workflowId không hợp lệ' })
  @IsOptional()
  workflowId?: string | null;
}

export class DeleteWorkTypeDto {
  @IsUUID('all', { message: 'fallbackWorkTypeId không hợp lệ' })
  @IsOptional()
  fallbackWorkTypeId?: string;
}

// ==========================================
// 2. STATUSES & WIP LIMIT DTO
// ==========================================
export class CreateStatusDto {
  @IsString({ message: 'Tên trạng thái phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên trạng thái không được để trống' })
  name: string;

  @IsEnum(StatusCategory, { message: 'Category phải là TODO, IN_PROGRESS hoặc DONE' })
  category: StatusCategory;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsInt({ message: 'wipLimit phải là số nguyên' })
  @Min(1, { message: 'wipLimit phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  wipLimit?: number | null;
}

export class UpdateStatusDto {
  @IsString({ message: 'Tên trạng thái phải là chuỗi ký tự' })
  @IsOptional()
  name?: string;

  @IsEnum(StatusCategory, { message: 'Category phải là TODO, IN_PROGRESS hoặc DONE' })
  @IsOptional()
  category?: StatusCategory;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsInt({ message: 'wipLimit phải là số nguyên' })
  @Min(1, { message: 'wipLimit phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  wipLimit?: number | null;
}

export class DeleteStatusDto {
  @IsUUID('all', { message: 'fallbackStatusId không hợp lệ' })
  @IsOptional()
  fallbackStatusId?: string;
}

// ==========================================
// 3. WORKFLOWS & TRANSITIONS DTO
// ==========================================
export class CreateWorkflowDto {
  @IsString({ message: 'Tên quy trình phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên quy trình không được để trống' })
  name: string;
}

export class UpdateWorkflowDto {
  @IsString({ message: 'Tên quy trình phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên quy trình không được để trống' })
  name: string;
}

export class TransitionItemDto {
  @IsUUID('all', { message: 'fromStatusId không hợp lệ' })
  @IsNotEmpty({ message: 'fromStatusId không được để trống' })
  fromStatusId: string;

  @IsUUID('all', { message: 'toStatusId không hợp lệ' })
  @IsNotEmpty({ message: 'toStatusId không được để trống' })
  toStatusId: string;

  @IsOptional()
  conditions?: Record<string, any>;
}

export class UpdateWorkflowTransitionsDto {
  @IsArray({ message: 'transitions phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => TransitionItemDto)
  transitions: TransitionItemDto[];
}

// ==========================================
// 4. CUSTOM FIELDS DTO
// ==========================================
export class CreateCustomFieldDto {
  @IsString({ message: 'Tên trường tùy chỉnh phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên trường tùy chỉnh không được để trống' })
  name: string;

  @IsEnum(CustomFieldType, { message: 'fieldType phải là TEXT, NUMBER, DATE hoặc SELECT' })
  fieldType: CustomFieldType;

  @IsArray({ message: 'options phải là mảng chuỗi ký tự' })
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @IsOptional()
  position?: number;
}

export class UpdateCustomFieldDto {
  @IsString({ message: 'Tên trường tùy chỉnh phải là chuỗi ký tự' })
  @IsOptional()
  name?: string;

  @IsEnum(CustomFieldType, { message: 'fieldType phải là TEXT, NUMBER, DATE hoặc SELECT' })
  @IsOptional()
  fieldType?: CustomFieldType;

  @IsArray({ message: 'options phải là mảng chuỗi ký tự' })
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @IsOptional()
  position?: number;
}

// ==========================================
// 5. PROJECT SETTINGS & METHODOLOGY DTO
// ==========================================
export class UpdateProjectSettingsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  startDate?: string | Date;

  @IsOptional()
  endDate?: string | Date;

  @IsEnum(ProjectMethodology, { message: 'methodology phải là SCRUM, KANBAN hoặc SCRUMBAN' })
  @IsOptional()
  methodology?: ProjectMethodology;

  @IsOptional()
  views?: string[];

  @IsOptional()
  settings?: Record<string, any>;
}
