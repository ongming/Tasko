import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsInt } from 'class-validator';
import { SprintStatus } from '../entities/sprint.entity.js';

export class CreateSprintDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  goal?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @IsOptional()
  position?: number;
}

export class UpdateSprintDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  goal?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(SprintStatus)
  @IsOptional()
  status?: SprintStatus;

  @IsInt()
  @IsOptional()
  position?: number;
}

export class StartSprintDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  goal?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Ngày bắt đầu Sprint không được để trống' })
  startDate: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Ngày kết thúc Sprint không được để trống' })
  endDate: string;
}

export class CompleteSprintDto {
  @IsString()
  @IsOptional()
  targetSprintId?: string | null;
}
