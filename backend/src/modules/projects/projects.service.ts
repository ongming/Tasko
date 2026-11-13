import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity.js';
import { Workspace } from '../workspaces/entities/workspace.entity.js';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,

    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  /**
   * 1. TẠO DỰ ÁN MỚI
   */
  async create(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const normalizedName = dto.name.trim();
    const normalizedKey = dto.key.trim().toUpperCase();
    const normalizedDescription = dto.description?.trim() || null;
    const color = dto.color?.trim() || 'bg-indigo-600';

    // 1. Kiểm tra Workspace tồn tại
    const workspace = await this.workspaceRepository.findOne({
      where: { id: dto.workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Không gian làm việc không tồn tại!');
    }

    // 2. Kiểm tra tư cách thành viên & quyền hạn
    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: dto.workspaceId, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không phải là thành viên của không gian làm việc này!');
    }

    if (member.role === WorkspaceRole.VIEWER) {
      throw new ForbiddenException('Thành viên chỉ xem (VIEWER) không có quyền tạo dự án mới!');
    }

    // 3. Kiểm tra tính duy nhất của Key trong cùng một Workspace
    const existingProject = await this.projectRepository.findOne({
      where: { workspace_id: dto.workspaceId, key: normalizedKey },
    });
    if (existingProject) {
      throw new ConflictException(
        `Mã dự án "${normalizedKey}" đã tồn tại trong không gian làm việc này! Vui lòng chọn mã khác.`,
      );
    }

    // 4. Tạo và lưu bản ghi Project
    const newProject = this.projectRepository.create({
      name: normalizedName,
      key: normalizedKey,
      color,
      description: normalizedDescription,
      workspace_id: dto.workspaceId,
      owner_id: userId,
    });

    const savedProject = await this.projectRepository.save(newProject);
    return this.mapToResponse(savedProject);
  }

  /**
   * 2. LẤY DANH SÁCH DỰ ÁN THEO WORKSPACE HOẶC TẤT CẢ DỰ ÁN CỦA USER
   */
  async findAllByWorkspace(userId: string, workspaceId?: string): Promise<ProjectResponseDto[]> {
    if (workspaceId) {
      const member = await this.workspaceMemberRepository.findOne({
        where: { workspace_id: workspaceId, user_id: userId },
      });
      if (!member) {
        throw new ForbiddenException('Bạn không có quyền truy cập danh sách dự án của không gian này!');
      }

      const projects = await this.projectRepository.find({
        where: { workspace_id: workspaceId },
        order: { created_at: 'DESC' },
      });

      return projects.map((p) => this.mapToResponse(p));
    }

    const userMemberships = await this.workspaceMemberRepository.find({
      where: { user_id: userId },
    });
    const userWorkspaceIds = userMemberships.map((m) => m.workspace_id);
    if (userWorkspaceIds.length === 0) return [];

    const projects = await this.projectRepository.find({
      where: { workspace_id: In(userWorkspaceIds) },
      order: { created_at: 'DESC' },
    });

    return projects.map((p) => this.mapToResponse(p));
  }

  /**
   * 3. LẤY CHI TIẾT 1 DỰ ÁN THEO ID
   */
  async findById(userId: string, projectId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa!');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin dự án này!');
    }

    return this.mapToResponse(project);
  }

  private mapToResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      key: project.key,
      color: project.color,
      description: project.description,
      workspaceId: project.workspace_id,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }
}
