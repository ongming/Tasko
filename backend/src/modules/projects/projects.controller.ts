import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * POST /api/v1/projects - Khởi tạo dự án mới trong Workspace
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, createProjectDto);
  }

  /**
   * GET /api/v1/projects?workspaceId=... - Lấy danh sách dự án
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.projectsService.findAllByWorkspace(userId, workspaceId);
  }

  /**
   * GET /api/v1/projects/:id - Lấy chi tiết dự án theo ID
   */
  @Get(':id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.findById(userId, id);
  }

  /**
   * GET /api/v1/projects/:id/statuses - Lấy danh sách cột Status của dự án
   */
  @Get(':id/statuses')
  async getStatuses(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.findStatusesByProject(userId, id);
  }

  /**
   * GET /api/v1/projects/:id/work-types - Lấy danh sách WorkType của dự án
   */
  @Get(':id/work-types')
  async getWorkTypes(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.findWorkTypesByProject(userId, id);
  }
}
