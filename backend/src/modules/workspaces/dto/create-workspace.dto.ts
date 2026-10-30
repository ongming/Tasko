import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString({ message: 'Tên không gian làm việc phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không gian làm việc không được để trống' })
  @MaxLength(100, { message: 'Tên không gian làm việc tối đa 100 ký tự' })
  name: string;

  @IsString({ message: 'Đường dẫn định danh phải là chuỗi' })
  @IsNotEmpty({ message: 'Đường dẫn định danh không được để trống' })
  @MaxLength(50, { message: 'Đường dẫn định danh tối đa 50 ký tự' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug chỉ được chứa chữ thường, số và dấu gạch nối (vd: tasko-team)',
  })
  slug: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự' })
  description?: string;
}
