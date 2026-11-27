import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';

export enum NotificationType {
  ASSIGNED = 'ASSIGNED',
  COMMENTED = 'COMMENTED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  DUE_SOON = 'DUE_SOON',
  PROJECT_INVITED = 'PROJECT_INVITED',
}

export interface NotificationDataPayload {
  workspaceSlug?: string;
  projectId?: string;
  projectKey?: string;
  taskId?: string;
  taskKey?: string;
  remindDate?: string;
}

@Entity('notifications')
@Index('idx_notifications_user_read', ['userId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: NotificationDataPayload | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
