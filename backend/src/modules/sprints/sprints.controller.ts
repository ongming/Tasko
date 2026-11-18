import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SprintsService } from './sprints.service.js';
import {
  CreateSprintDto,
  UpdateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from './dto/sprint.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects/:projectId/sprints')
@UseGuards(JwtAuthGuard, RbacPermissionGuard)
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getSprints(@Param('projectId') projectId: string) {
    return this.sprintsService.getSprints(projectId);
  }

  @Post()
  @RequirePermission('SPRINT_MANAGE')
  @HttpCode(HttpStatus.CREATED)
  async createSprint(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.sprintsService.createSprint(userId, projectId, dto);
  }

  @Patch(':sprintId')
  @RequirePermission('SPRINT_MANAGE')
  async updateSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.sprintsService.updateSprint(userId, sprintId, dto);
  }

  @Post(':sprintId/start')
  @RequirePermission('SPRINT_MANAGE')
  async startSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: StartSprintDto,
  ) {
    return this.sprintsService.startSprint(userId, sprintId, dto);
  }

  @Post(':sprintId/complete')
  @RequirePermission('SPRINT_MANAGE')
  async completeSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: CompleteSprintDto,
  ) {
    return this.sprintsService.completeSprint(userId, sprintId, dto);
  }

  @Delete(':sprintId')
  @RequirePermission('SPRINT_MANAGE')
  async deleteSprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintsService.deleteSprint(userId, sprintId);
  }
}
