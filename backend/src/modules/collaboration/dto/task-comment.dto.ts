import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTaskCommentDto {
  @Transform(trimString)
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @MaxLength(5000, { message: 'Nội dung bình luận không được vượt quá 5000 ký tự' })
  content: string;
}

export class UpdateTaskCommentDto {
  @Transform(trimString)
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @MaxLength(5000, { message: 'Nội dung bình luận không được vượt quá 5000 ký tự' })
  content: string;
}
