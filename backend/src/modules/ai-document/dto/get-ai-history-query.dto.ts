import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AiAnalysisStatus } from '../entities/ai-analysis.entity.js';

export class GetAiHistoryQueryDto {
  @IsOptional()
  @IsEnum(AiAnalysisStatus, {
    message: 'status phải thuộc một trong: UPLOADED, ANALYZING, COMPLETED, APPLIED, FAILED',
  })
  status?: AiAnalysisStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
  @Max(50, { message: 'limit tối đa là 50' })
  limit?: number;
}
