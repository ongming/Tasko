import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzeDocumentDto {
  @IsOptional()
  @IsString({ message: 'Ghi chú định hướng phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Ghi chú định hướng tối đa 1000 ký tự' })
  hint?: string;
}
