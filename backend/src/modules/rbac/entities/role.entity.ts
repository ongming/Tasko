import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
  type Relation,
} from 'typeorm';
import { RolePermission } from './role-permission.entity.js';

export enum RoleScope {
  WORKSPACE = 'WORKSPACE',
  PROJECT = 'PROJECT',
}

@Entity('roles')
@Unique('uq_roles_name_scope', ['name', 'scope'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({
    type: 'enum',
    enum: RoleScope,
  })
  scope: RoleScope;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: Relation<RolePermission[]>;
}
