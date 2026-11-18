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
import { Project } from '../../projects/entities/project.entity.js';
import { Sprint } from '../../sprints/entities/sprint.entity.js';
import { Status } from '../../projects/entities/status.entity.js';
import { WorkType } from '../../projects/entities/work-type.entity.js';
import { User } from '../../auth/entities/user.entity.js';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('tasks')
@Index('idx_tasks_project_sprint', ['project_id', 'sprint_id'])
@Index('idx_tasks_project_key_unique', ['project_id', 'task_key'], { unique: true })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Relation<Project>;

  @Column({ type: 'uuid', nullable: true })
  sprint_id: string | null;

  @ManyToOne(() => Sprint, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Relation<Sprint> | null;

  @Column({ type: 'varchar', length: 30 })
  task_key: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  type_id: string | null;

  @ManyToOne(() => WorkType, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'type_id' })
  type: Relation<WorkType> | null;

  @Column({ type: 'uuid' })
  status_id: string;

  @ManyToOne(() => Status, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'status_id' })
  status: Relation<Status>;

  @Column({ type: 'integer', nullable: true })
  story_points: number | null;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'uuid', nullable: true })
  assignee_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: Relation<User> | null;

  @Column({ type: 'uuid', nullable: true })
  reporter_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reporter_id' })
  reporter: Relation<User> | null;

  @Column({ type: 'integer', default: 1000 })
  position: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
