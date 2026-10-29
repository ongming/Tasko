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

@Entity('sessions')
export class Session {
  // Mã định danh phiên (UUID) - đóng vai trò Session Family ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mã băm SHA-256 của Refresh Token hiện tại (không lưu plain text token)
  @Column({ type: 'varchar', length: 255 })
  refresh_token_hash: string;

  // Thời điểm phiên đăng nhập hết hạn (mặc định 7 ngày sau lần xoay vòng gần nhất)
  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  // Khóa ngoại nối về bảng users
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
