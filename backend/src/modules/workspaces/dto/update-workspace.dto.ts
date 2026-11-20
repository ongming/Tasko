import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString({ message: 'Tên không gian làm việc phải là chuỗi' })
  @MaxLength(100, { message: 'Tên không gian làm việc tối đa 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự' })
  description?: string;
}
