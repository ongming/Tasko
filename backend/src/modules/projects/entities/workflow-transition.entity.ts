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
import { Workflow } from './workflow.entity.js';
import { Status } from './status.entity.js';

@Entity('workflow_transitions')
@Unique(['workflowId', 'fromStatusId', 'toStatusId'])
export class WorkflowTransition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workflow_id', type: 'uuid' })
  workflowId: string;

  @ManyToOne(() => Workflow, (w) => w.transitions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Relation<Workflow>;

  @Column({ name: 'from_status_id', type: 'uuid' })
  fromStatusId: string;

  @ManyToOne(() => Status, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_status_id' })
  fromStatus: Relation<Status>;

  @Column({ name: 'to_status_id', type: 'uuid' })
  toStatusId: string;

  @ManyToOne(() => Status, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_status_id' })
  toStatus: Relation<Status>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  conditions: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
