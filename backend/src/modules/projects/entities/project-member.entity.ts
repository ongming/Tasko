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
import { Project } from './project.entity.js';
import { User } from '../../auth/entities/user.entity.js';

export enum ProjectRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

@Entity('project_members')
@Index('idx_project_members_project_user_unique', ['project_id', 'user_id'], { unique: true })
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Relation<Project>;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.MEMBER,
  })
  role: ProjectRole;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  joined_at: Date;
}
