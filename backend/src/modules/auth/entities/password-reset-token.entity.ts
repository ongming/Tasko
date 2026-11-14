import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity.js';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mã băm SHA-256 của OTP (dùng để tra cứu và xác thực — không lưu OTP gốc vì lý do bảo mật)
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  otp_hash: string;

  // Thời điểm OTP hết hạn (mặc định 15 phút kể từ khi tạo)
  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  // Trạng thái đã sử dụng (mặc định false)
  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  // Khóa ngoại nối về User cần đặt lại mật khẩu
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
