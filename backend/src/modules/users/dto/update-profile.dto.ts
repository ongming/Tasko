import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(1, { message: 'Họ và tên không được để trống.' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự.' })
  fullName?: string;
}
