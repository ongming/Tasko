import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AiDocumentService } from './ai-document.service.js';
import { MAX_DOCUMENT_SIZE_BYTES } from './document-parser.service.js';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto.js';
import { UpdateSuggestedTasksDto } from './dto/update-suggested-tasks.dto.js';
import { ConfirmAiTasksDto } from './dto/confirm-ai-tasks.dto.js';
import { GetAiHistoryQueryDto } from './dto/get-ai-history-query.dto.js';

@Controller('projects/:projectId/ai-document')
@UseGuards(JwtAuthGuard, RbacPermissionGuard)
export class AiDocumentController {
  constructor(private readonly aiDocumentService: AiDocumentService) {}

  /**
   * AIDOC-01: Tải lên tài liệu (.pdf, .docx, .md, .txt) và trích xuất văn bản thô
   * POST /api/v1/projects/:projectId/ai-document/upload
   */
  @Post('upload')
  @RequirePermission('COLLAB_AND_AI_USE')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_DOCUMENT_SIZE_BYTES,
      },
    }),
  )
  async uploadDocument(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tệp tài liệu để tải lên.');
    }
    return this.aiDocumentService.uploadDocument(projectId, userId, file);
  }

  /**
   * AIDOC-02: Phân tích tài liệu đã tải lên bằng Google Gemini API
   * POST /api/v1/projects/:projectId/ai-document/:analysisId/analyze
   */
  @Post(':analysisId/analyze')
  @RequirePermission('COLLAB_AND_AI_USE')
  async analyzeDocument(
    @Param('projectId') projectId: string,
    @Param('analysisId') analysisId: string,
    @Body() dto: AnalyzeDocumentDto,
  ) {
    return this.aiDocumentService.analyzeDocument(projectId, analysisId, dto?.hint);
  }

  /**
   * AIDOC-06: Xem lịch sử các lần phân tích tài liệu của dự án
   * GET /api/v1/projects/:projectId/ai-document/history
   * (Đặt trước route :analysisId để tránh đụng param động)
   */
  @Get('history')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getHistory(
    @Param('projectId') projectId: string,
    @Query() query: GetAiHistoryQueryDto,
  ) {
    return this.aiDocumentService.getHistory(projectId, query);
  }

  /**
   * AIDOC-03: Xem chi tiết bản phân tích và danh sách công việc đề xuất
   * GET /api/v1/projects/:projectId/ai-document/:analysisId
   */
  @Get(':analysisId')
  @RequirePermission('PROJECT_VIEW_ONLY')
  async getAnalysisDetail(
    @Param('projectId') projectId: string,
    @Param('analysisId') analysisId: string,
  ) {
    return this.aiDocumentService.getAnalysisDetail(projectId, analysisId);
  }

  /**
   * AIDOC-04: Chỉnh sửa danh sách công việc đề xuất (lưu bản nháp) trước khi tạo Task thật
   * PATCH /api/v1/projects/:projectId/ai-document/:analysisId/suggestions
   */
  @Patch(':analysisId/suggestions')
  @RequirePermission('COLLAB_AND_AI_USE')
  async updateSuggestions(
    @Param('projectId') projectId: string,
    @Param('analysisId') analysisId: string,
    @Body() dto: UpdateSuggestedTasksDto,
  ) {
    return this.aiDocumentService.updateSuggestions(projectId, analysisId, dto);
  }

  /**
   * AIDOC-05: Xác nhận tạo hàng loạt Task thật trong 1 Transaction
   * POST /api/v1/projects/:projectId/ai-document/:analysisId/confirm
   */
  @Post(':analysisId/confirm')
  @RequirePermission('COLLAB_AND_AI_USE', 'TASK_WRITE')
  async confirmTasks(
    @Param('projectId') projectId: string,
    @Param('analysisId') analysisId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ConfirmAiTasksDto,
  ) {
    return this.aiDocumentService.confirmTasks(projectId, analysisId, userId, dto || {});
  }
}
