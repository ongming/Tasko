import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity.js';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mã băm SHA-256 của token kích hoạt gửi qua email
  @Column({ type: 'varchar', length: 255 })
  token_hash: string;

  // Thời điểm token hết hạn (mặc định 24 giờ kể từ khi tạo)
  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  // Khóa ngoại nối về User cần kích hoạt
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
