import { WorkspaceRole } from '../enums/workspace-role.enum.js';

export class WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: WorkspaceRole;
  ownerId: string;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
