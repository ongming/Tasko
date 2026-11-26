import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  type Relation,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity.js';
import { Label } from './label.entity.js';

@Entity('task_labels')
@Unique(['taskId', 'labelId'])
@Index('idx_task_labels_task', ['taskId'])
@Index('idx_task_labels_label', ['labelId'])
export class TaskLabel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, (t) => t.taskLabels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Relation<Task>;

  @Column({ name: 'label_id', type: 'uuid' })
  labelId: string;

  @ManyToOne(() => Label, (l) => l.taskLabels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'label_id' })
  label: Relation<Label>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
