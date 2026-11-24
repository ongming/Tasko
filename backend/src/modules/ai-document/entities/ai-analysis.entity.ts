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
import { User } from '../../auth/entities/user.entity.js';

export enum AiDocumentFileType {
  PDF = 'pdf',
  DOCX = 'docx',
  MD = 'md',
  TXT = 'txt',
}

export enum AiAnalysisStatus {
  UPLOADED = 'UPLOADED',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  APPLIED = 'APPLIED',
  FAILED = 'FAILED',
}

export interface AiSuggestedTaskItem {
  tempId: string;
  selected: boolean;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  storyPoints: number | null;
  estimatedHours: number | null;
  assigneeId: string | null;
  workTypeId: string | null;
  sprintId: string | null;
  startDate: string | null;
  dueDate: string | null;
}

@Entity('ai_analyses')
@Index('idx_ai_analyses_project_created', ['project_id', 'created_at'])
export class AiAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Relation<Project>;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User> | null;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({
    type: 'enum',
    enum: AiDocumentFileType,
  })
  file_type: AiDocumentFileType;

  @Column({ type: 'integer' })
  file_size: number;

  @Column({ type: 'text' })
  extracted_text: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  suggested_tasks: AiSuggestedTaskItem[];

  @Column({
    type: 'enum',
    enum: AiAnalysisStatus,
    default: AiAnalysisStatus.UPLOADED,
  })
  status: AiAnalysisStatus;

  @Column({ type: 'integer', default: 0 })
  applied_task_count: number;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
