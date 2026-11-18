import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Task } from './task.entity.js';
import { CustomField } from '../../projects/entities/custom-field.entity.js';

@Entity('custom_field_values')
@Unique(['taskId', 'customFieldId'])
export class CustomFieldValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Relation<Task>;

  @Column({ name: 'custom_field_id', type: 'uuid' })
  customFieldId: string;

  @ManyToOne(() => CustomField, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'custom_field_id' })
  customField: Relation<CustomField>;

  @Column({ type: 'jsonb' })
  value: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
