export class ProjectResponseDto {
  id: string;
  name: string;
  key: string;
  color: string;
  description: string | null;
  settings?: Record<string, any>;
  workspaceId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
