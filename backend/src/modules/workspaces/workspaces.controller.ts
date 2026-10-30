import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  /**
   * POST /api/v1/workspaces - Tạo không gian làm việc mới
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(userId, createWorkspaceDto);
  }

  /**
   * GET /api/v1/workspaces - Lấy danh sách workspace của user hiện tại
   */
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.workspacesService.findAllByUser(userId);
  }

  /**
   * GET /api/v1/workspaces/:slug - Lấy thông tin chi tiết workspace theo slug
   */
  @Get(':slug')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('slug') slug: string,
  ) {
    return this.workspacesService.findBySlug(userId, slug);
  }
}
