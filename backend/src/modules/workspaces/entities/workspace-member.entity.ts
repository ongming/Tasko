import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  type Relation,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import type { Workspace } from './workspace.entity.js';
import { WorkspaceRole } from '../enums/workspace-role.enum.js';
import { Role } from '../../rbac/entities/role.entity.js';

@Entity('workspace_members')
@Unique('idx_workspace_members_unique', ['workspace_id', 'user_id'])
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_workspace_members_workspace_id')
  @Column({ type: 'uuid' })
  workspace_id: string;

  @Index('idx_workspace_members_user_id')
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: WorkspaceRole,
    default: WorkspaceRole.MEMBER,
  })
  role: WorkspaceRole;

  @Column({ type: 'uuid', nullable: true, name: 'role_id' })
  roleId: string | null;

  @ManyToOne(() => Role, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  roleEntity: Relation<Role> | null;

  @ManyToOne('Workspace', 'members', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Relation<Workspace>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  joined_at: Date;
}
