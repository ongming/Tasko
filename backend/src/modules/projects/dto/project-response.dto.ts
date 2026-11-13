export class ProjectResponseDto {
  id: string;
  name: string;
  key: string;
  color: string;
  description: string | null;
  workspaceId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
