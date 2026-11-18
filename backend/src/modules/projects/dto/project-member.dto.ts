import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AddProjectMemberDto {
  @IsUUID('all', { message: 'ID người dùng phải là định dạng UUID' })
  @IsOptional()
  userId?: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsOptional()
  email?: string;

  @IsUUID('all', { message: 'ID vai trò phải là định dạng UUID' })
  @IsNotEmpty({ message: 'ID vai trò không được để trống' })
  roleId: string;
}

export class UpdateProjectMemberRoleDto {
  @IsUUID('all', { message: 'ID vai trò phải là định dạng UUID' })
  @IsNotEmpty({ message: 'ID vai trò không được để trống' })
  roleId: string;
}

export class TransferOwnershipDto {
  @IsUUID('all', { message: 'ID người nhận phải là định dạng UUID' })
  @IsNotEmpty({ message: 'ID người nhận không được để trống' })
  targetUserId: string;
}
