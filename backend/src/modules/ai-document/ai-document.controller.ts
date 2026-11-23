import {
  Controller,
  Post,
  Param,
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
}
