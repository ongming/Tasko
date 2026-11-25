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
import { Task } from '../../tasks/entities/task.entity.js';
import { User } from '../../auth/entities/user.entity.js';

@Entity('task_attachments')
@Index('idx_task_attachments_task_created', ['task_id', 'created_at'])
export class TaskAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Relation<Task>;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User> | null;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'text' })
  file_url: string;

  @Column({ type: 'varchar', length: 255 })
  public_id: string;

  @Column({ type: 'varchar', length: 20, default: 'raw' })
  resource_type: string;

  @Column({ type: 'varchar', length: 120 })
  mime_type: string;

  @Column({ type: 'integer' })
  file_size: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
