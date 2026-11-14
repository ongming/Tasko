import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Length,
  Matches,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'Tên dự án phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  @MaxLength(100, { message: 'Tên dự án tối đa 100 ký tự' })
  name: string;

  @IsString({ message: 'Mã dự án (Key) phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã dự án không được để trống' })
  @Length(2, 10, { message: 'Mã dự án phải từ 2 đến 10 ký tự' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Mã dự án chỉ được chứa chữ cái và số (không có khoảng trắng hay ký tự đặc biệt)',
  })
  key: string;

  @IsUUID('all', { message: 'Mã định danh không gian làm việc (workspaceId) không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp workspaceId' })
  workspaceId: string;

  @IsString({ message: 'Mã màu phải là chuỗi ký tự' })
  @IsOptional()
  color?: string;

  @IsString({ message: 'Mô tả dự án phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả dự án tối đa 500 ký tự' })
  description?: string;

  @IsOptional()
  workflow?: Array<{
    label: string;
    category?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    color?: string;
  }>;

  @IsOptional()
  workTypes?: Array<{
    label: string;
    icon?: string;
    color?: string;
  }>;

  @IsOptional()
  settings?: Record<string, any>;
}
