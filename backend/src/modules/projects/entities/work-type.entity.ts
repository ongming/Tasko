import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { Project } from './project.entity.js';
import { Workflow } from './workflow.entity.js';

@Entity('work_types')
@Index('idx_work_types_project', ['project_id'])
export class WorkType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Relation<Project>;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'CheckSquare' })
  icon: string;

  @Column({ type: 'varchar', length: 50, default: 'bg-blue-100 text-blue-700' })
  color: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @Column({ name: 'is_subtask', type: 'boolean', default: false })
  isSubtask: boolean;

  @Column({ name: 'workflow_id', type: 'uuid', nullable: true })
  workflowId: string | null;

  @ManyToOne(() => Workflow, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Relation<Workflow> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
