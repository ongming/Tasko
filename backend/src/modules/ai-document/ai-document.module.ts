import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysis } from './entities/ai-analysis.entity.js';
import { DocumentParserService } from './document-parser.service.js';
import { AiDocumentService } from './ai-document.service.js';
import { AiDocumentController } from './ai-document.controller.js';
import { ProjectsModule } from '../projects/projects.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysis]), ProjectsModule],
  controllers: [AiDocumentController],
  providers: [DocumentParserService, AiDocumentService],
  exports: [DocumentParserService, AiDocumentService, TypeOrmModule],
})
export class AiDocumentModule {}
