import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Role } from './role.entity.js';
import { Permission } from './permission.entity.js';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ type: 'uuid', name: 'role_id' })
  role_id: string;

  @PrimaryColumn({ type: 'uuid', name: 'permission_id' })
  permission_id: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>;

  @ManyToOne(() => Permission, (perm) => perm.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Relation<Permission>;
}
