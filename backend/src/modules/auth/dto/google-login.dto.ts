import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsOptional()
  @IsString({ message: 'Google Credential phải là chuỗi ký tự' })
  credential?: string;

  @IsOptional()
  @IsString({ message: 'Google Access Token phải là chuỗi ký tự' })
  accessToken?: string;
}
