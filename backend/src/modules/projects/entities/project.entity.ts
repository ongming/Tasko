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
import { User } from '../../auth/entities/user.entity.js';
import { Workspace } from '../../workspaces/entities/workspace.entity.js';

@Entity('projects')
@Index('idx_projects_workspace_key_unique', ['workspace_id', 'key'], { unique: true })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  key: string;

  @Column({ type: 'varchar', length: 50, default: 'bg-indigo-600' })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" })
  settings: Record<string, any>;

  @Column({ type: 'uuid' })
  workspace_id: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Relation<Workspace>;

  @Column({ type: 'uuid' })
  owner_id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner: Relation<User>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
