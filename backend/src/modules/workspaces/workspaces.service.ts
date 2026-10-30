import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity.js';
import { WorkspaceMember } from './entities/workspace-member.entity.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { WorkspaceRole } from './enums/workspace-role.enum.js';
import { WorkspaceResponseDto } from './dto/workspace-response.dto.js';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepo: Repository<WorkspaceMember>,
  ) {}

  /**
   * Tạo Workspace mới trong Transaction nguyên tử
   */
  async create(userId: string, dto: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    const slug = dto.slug.toLowerCase().trim();

    // 1. Kiểm tra tính duy nhất của slug
    const existing = await this.workspaceRepo.findOne({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(
        `Đường dẫn định danh (slug) "${slug}" đã tồn tại. Vui lòng chọn slug khác.`,
      );
    }

    // 2. Chạy Database Transaction đảm bảo tạo Workspace và gán quyền OWNER cho Creator
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2.1. Lưu bản ghi Workspace
      const workspace = queryRunner.manager.create(Workspace, {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        owner_id: userId,
      });
      const savedWorkspace = await queryRunner.manager.save(workspace);

      // 2.2. Gán Creator làm OWNER trong workspace_members
      const member = queryRunner.manager.create(WorkspaceMember, {
        workspace_id: savedWorkspace.id,
        user_id: userId,
        role: WorkspaceRole.OWNER,
      });
      await queryRunner.manager.save(member);

      await queryRunner.commitTransaction();

      return {
        id: savedWorkspace.id,
        name: savedWorkspace.name,
        slug: savedWorkspace.slug,
        description: savedWorkspace.description,
        role: WorkspaceRole.OWNER,
        ownerId: savedWorkspace.owner_id,
        memberCount: 1,
        createdAt: savedWorkspace.created_at,
        updatedAt: savedWorkspace.updated_at,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy danh sách tất cả các Workspace mà User là thành viên
   */
  async findAllByUser(userId: string): Promise<WorkspaceResponseDto[]> {
    const memberships = await this.memberRepo.find({
      where: { user_id: userId },
      relations: { workspace: true },
      order: { joined_at: 'DESC' },
    });

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      description: m.workspace.description,
      role: m.role,
      ownerId: m.workspace.owner_id,
      createdAt: m.workspace.created_at,
      updatedAt: m.workspace.updated_at,
    }));
  }

  /**
   * Lấy chi tiết Workspace theo slug và kiểm tra quyền truy cập
   */
  async findBySlug(userId: string, slug: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceRepo.findOne({
      where: { slug: slug.toLowerCase().trim() },
    });

    if (!workspace) {
      throw new NotFoundException(`Không tìm thấy không gian làm việc với slug "${slug}"`);
    }

    const membership = await this.memberRepo.findOne({
      where: { workspace_id: workspace.id, user_id: userId },
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền truy cập vào không gian làm việc này');
    }

    const memberCount = await this.memberRepo.count({
      where: { workspace_id: workspace.id },
    });

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      role: membership.role,
      ownerId: workspace.owner_id,
      memberCount,
      createdAt: workspace.created_at,
      updatedAt: workspace.updated_at,
    };
  }
}
