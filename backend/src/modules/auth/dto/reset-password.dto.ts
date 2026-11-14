import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Địa chỉ email không hợp lệ!' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string;

  @IsString({ message: 'OTP phải là chuỗi ký tự!' })
  @Length(6, 6, { message: 'OTP phải có đúng 6 chữ số!' })
  @IsNotEmpty({ message: 'OTP không được để trống!' })
  otp: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự!' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự!' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống!' })
  newPassword: string;
}
