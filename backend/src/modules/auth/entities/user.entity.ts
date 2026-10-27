import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  // +id: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // +String: email (duy nhất)
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // +String: password_hash (mật khẩu đã băm bằng bcrypt)
  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  // +String: full_name
  @Column({ type: 'varchar', length: 150 })
  full_name: string;

  // +String: avatar_url (cho phép null)
  @Column({ type: 'text', nullable: true })
  avatar_url: string | null;

  // +Boolean: is_active (mặc định active = false, cần kích hoạt email)
  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  // +DateTime: created_at
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}

