import { Injectable, BadRequestException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { AiDocumentFileType } from './entities/ai-analysis.entity.js';

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_EXTRACTED_TEXT_LENGTH = 30_000;
export const EXTRACTED_PREVIEW_LENGTH = 400;

const ALLOWED_MIME_TYPES_BY_EXT: Record<AiDocumentFileType, string[]> = {
  [AiDocumentFileType.PDF]: ['application/pdf'],
  [AiDocumentFileType.DOCX]: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/octet-stream',
  ],
  [AiDocumentFileType.MD]: [
    'text/markdown',
    'text/x-markdown',
    'text/plain',
    'application/octet-stream',
  ],
  [AiDocumentFileType.TXT]: ['text/plain', 'application/octet-stream'],
};

export interface ParsedDocumentResult {
  fileName: string;
  fileType: AiDocumentFileType;
  fileSize: number;
  extractedText: string;
  extractedTextPreview: string;
}

@Injectable()
export class DocumentParserService {
  /**
   * Lấy phần mở rộng hợp lệ từ tên tệp
   */
  private extractFileType(fileName: string): AiDocumentFileType | null {
    const normalized = fileName.trim().toLowerCase();
    const parts = normalized.split('.');
    if (parts.length < 2) return null;
    const ext = parts[parts.length - 1];
    if (Object.values(AiDocumentFileType).includes(ext as AiDocumentFileType)) {
      return ext as AiDocumentFileType;
    }
    return null;
  }

  /**
   * Chuẩn hóa khoảng trắng và cắt gọn văn bản tối đa 30.000 ký tự
   */
  normalizeText(rawText: string): string {
    const cleaned = rawText
      .split('\0')
      .join('')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleaned.length <= MAX_EXTRACTED_TEXT_LENGTH) {
      return cleaned;
    }
    return cleaned.slice(0, MAX_EXTRACTED_TEXT_LENGTH);
  }

  /**
   * Tạo đoạn xem trước ngắn gọn của văn bản đã trích xuất
   */
  buildPreview(text: string): string {
    if (text.length <= EXTRACTED_PREVIEW_LENGTH) {
      return text;
    }
    return `${text.slice(0, EXTRACTED_PREVIEW_LENGTH)}...`;
  }

  /**
   * Kiểm tra định dạng, MIME type, dung lượng và trích xuất văn bản thô từ buffer
   */
  async parseDocument(file: Express.Multer.File | undefined): Promise<ParsedDocumentResult> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tệp tài liệu để tải lên.');
    }

    const fileType = this.extractFileType(file.originalname || '');
    if (!fileType) {
      throw new BadRequestException(
        'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận .pdf, .docx, .md hoặc .txt.',
      );
    }

    const mime = (file.mimetype || '').toLowerCase().split(';')[0].trim();
    const allowedMimes = ALLOWED_MIME_TYPES_BY_EXT[fileType];
    if (mime && !allowedMimes.includes(mime)) {
      throw new BadRequestException(
        `Kiểu MIME "${file.mimetype}" không hợp lệ cho tệp .${fileType}.`,
      );
    }

    const fileSize = typeof file.size === 'number' ? file.size : file.buffer?.length ?? 0;
    if (fileSize > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException('Dung lượng tệp vượt quá giới hạn tối đa 10 MB.');
    }

    if (!file.buffer || file.buffer.length === 0 || fileSize === 0) {
      throw new BadRequestException('Tệp tài liệu đang trống, không có nội dung để trích xuất.');
    }

    let rawText = '';
    try {
      rawText = await this.extractRawText(file.buffer, fileType);
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(
        `Không thể đọc nội dung tệp .${fileType}. Vui lòng kiểm tra tệp không bị hỏng hoặc mã hóa mật khẩu.`,
      );
    }

    const extractedText = this.normalizeText(rawText);
    if (!extractedText) {
      throw new BadRequestException(
        'Không tìm thấy nội dung văn bản hợp lệ trong tài liệu (tệp rỗng hoặc chỉ chứa hình ảnh scan).',
      );
    }

    return {
      fileName: file.originalname,
      fileType,
      fileSize,
      extractedText,
      extractedTextPreview: this.buildPreview(extractedText),
    };
  }

  private async extractRawText(buffer: Buffer, fileType: AiDocumentFileType): Promise<string> {
    switch (fileType) {
      case AiDocumentFileType.PDF: {
        const parser = new PDFParse({ data: buffer });
        try {
          const result = await parser.getText();
          return result.text || '';
        } finally {
          await parser.destroy();
        }
      }
      case AiDocumentFileType.DOCX: {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      }
      case AiDocumentFileType.MD:
      case AiDocumentFileType.TXT:
        return buffer.toString('utf-8');
    }
  }
}
