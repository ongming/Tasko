import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class AddWorkspaceMemberDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsUUID('all', { message: 'ID vai trò phải là định dạng UUID' })
  @IsNotEmpty({ message: 'ID vai trò không được để trống' })
  roleId: string;
}

export class UpdateWorkspaceMemberRoleDto {
  @IsUUID('all', { message: 'ID vai trò phải là định dạng UUID' })
  @IsNotEmpty({ message: 'ID vai trò không được để trống' })
  roleId: string;
}
