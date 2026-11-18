export type ProjectRoleName = 'OWNER' | 'MEMBER' | 'VIEWER';
export type WorkspaceRoleName = 'ADMIN' | 'MEMBER' | 'OWNER';

export interface Role {
  id: string;
  name: string;
  scope: 'WORKSPACE' | 'PROJECT';
  description?: string | null;
}

export interface MemberUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user: MemberUser;
  roleId: string | null;
  role: {
    id: string | null;
    name: string;
  };
  joinedAt: string;
}

export interface WorkspaceMemberItem {
  id: string;
  userId: string;
  user: MemberUser;
  roleId: string | null;
  role: {
    id: string | null;
    name: string;
  };
  joinedAt: string;
}

export interface AddProjectMemberPayload {
  userId?: string;
  email?: string;
  roleId: string;
}

export interface UpdateProjectMemberRolePayload {
  roleId: string;
}

export interface TransferOwnershipPayload {
  targetUserId: string;
}
