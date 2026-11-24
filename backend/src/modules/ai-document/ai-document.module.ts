import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysis } from './entities/ai-analysis.entity.js';
import { ProjectMember } from '../projects/entities/project-member.entity.js';
import { WorkType } from '../projects/entities/work-type.entity.js';
import { DocumentParserService } from './document-parser.service.js';
import { AiDocumentService } from './ai-document.service.js';
import { AiDocumentController } from './ai-document.controller.js';
import { GeminiAiService } from './gemini-ai.service.js';
import { AI_SERVICE } from './interfaces/ai-service.interface.js';
import { ProjectsModule } from '../projects/projects.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAnalysis, ProjectMember, WorkType]),
    ProjectsModule,
  ],
  controllers: [AiDocumentController],
  providers: [
    DocumentParserService,
    GeminiAiService,
    {
      provide: AI_SERVICE,
      useExisting: GeminiAiService,
    },
    AiDocumentService,
  ],
  exports: [DocumentParserService, AiDocumentService, AI_SERVICE, TypeOrmModule],
})
export class AiDocumentModule {}
