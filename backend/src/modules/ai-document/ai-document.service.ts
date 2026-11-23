import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiAnalysis,
  AiAnalysisStatus,
  AiDocumentFileType,
} from './entities/ai-analysis.entity.js';
import { DocumentParserService } from './document-parser.service.js';
import { ProjectsService } from '../projects/projects.service.js';

export interface UploadDocumentResponse {
  id: string;
  fileName: string;
  fileType: AiDocumentFileType;
  fileSize: number;
  status: AiAnalysisStatus;
  extractedTextPreview: string;
  createdAt: Date;
}

@Injectable()
export class AiDocumentService {
  constructor(
    @InjectRepository(AiAnalysis)
    private readonly aiAnalysisRepository: Repository<AiAnalysis>,
    private readonly projectsService: ProjectsService,
    private readonly documentParserService: DocumentParserService,
  ) {}

  /**
   * AIDOC-01: Tải lên tài liệu, trích xuất văn bản và lưu bản ghi AiAnalysis (status: UPLOADED)
   */
  async uploadDocument(
    projectIdOrKey: string,
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<UploadDocumentResponse> {
    const project = await this.projectsService.findProjectEntity(projectIdOrKey);
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    const parsed = await this.documentParserService.parseDocument(file);

    const analysis = this.aiAnalysisRepository.create({
      project_id: project.id,
      user_id: userId,
      file_name: parsed.fileName,
      file_type: parsed.fileType,
      file_size: parsed.fileSize,
      extracted_text: parsed.extractedText,
      suggested_tasks: [],
      status: AiAnalysisStatus.UPLOADED,
      applied_task_count: 0,
      error_message: null,
    });

    const saved = await this.aiAnalysisRepository.save(analysis);

    return {
      id: saved.id,
      fileName: saved.file_name,
      fileType: saved.file_type,
      fileSize: saved.file_size,
      status: saved.status,
      extractedTextPreview: parsed.extractedTextPreview,
      createdAt: saved.created_at,
    };
  }
}
