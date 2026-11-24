import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import {
  DocumentParserService,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_EXTRACTED_TEXT_LENGTH,
  EXTRACTED_PREVIEW_LENGTH,
} from './document-parser.service.js';
import { AiDocumentFileType } from './entities/ai-analysis.entity.js';

function createMulterFile(overrides: Partial<Express.Multer.File>): Express.Multer.File {
  const buffer = overrides.buffer ?? Buffer.from('Nội dung tài liệu mẫu', 'utf-8');
  return {
    fieldname: 'file',
    originalname: 'spec.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: buffer.length,
    buffer,
    stream: null as unknown as Express.Multer.File['stream'],
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('DocumentParserService', () => {
  let service: DocumentParserService;

  beforeEach(() => {
    service = new DocumentParserService();
  });

  it('trích xuất và chuẩn hóa khoảng trắng thành công cho tệp .txt hợp lệ', async () => {
    const raw = '  Yêu cầu   nghiệp vụ\r\n\r\n\r\n- Tạo API   đăng nhập\t\tJWT  \n  ';
    const file = createMulterFile({
      originalname: 'yeu-cau.txt',
      mimetype: 'text/plain',
      buffer: Buffer.from(raw, 'utf-8'),
    });

    const result = await service.parseDocument(file);

    expect(result.fileName).toBe('yeu-cau.txt');
    expect(result.fileType).toBe(AiDocumentFileType.TXT);
    expect(result.extractedText).toBe('Yêu cầu nghiệp vụ\n\n- Tạo API đăng nhập JWT');
    expect(result.extractedTextPreview).toBe(result.extractedText);
  });

  it('trích xuất thành công tệp .md và cắt tối đa 30.000 ký tự kèm preview rút gọn', async () => {
    const longContent = `# Đặc tả hệ thống\n${'A'.repeat(MAX_EXTRACTED_TEXT_LENGTH + 500)}`;
    const file = createMulterFile({
      originalname: 'architecture.md',
      mimetype: 'text/markdown',
      buffer: Buffer.from(longContent, 'utf-8'),
    });

    const result = await service.parseDocument(file);

    expect(result.fileType).toBe(AiDocumentFileType.MD);
    expect(result.extractedText.length).toBe(MAX_EXTRACTED_TEXT_LENGTH);
    expect(result.extractedTextPreview.length).toBe(EXTRACTED_PREVIEW_LENGTH + 3);
    expect(result.extractedTextPreview.endsWith('...')).toBe(true);
  });

  it('ném BadRequestException khi không có tệp tải lên', async () => {
    await expect(service.parseDocument(undefined)).rejects.toThrow(BadRequestException);
  });

  it('ném BadRequestException khi tệp sai định dạng mở rộng', async () => {
    const file = createMulterFile({
      originalname: 'diagram.png',
      mimetype: 'image/png',
    });

    await expect(service.parseDocument(file)).rejects.toThrow(BadRequestException);
  });

  it('ném BadRequestException khi MIME type không khớp với định dạng tệp', async () => {
    const file = createMulterFile({
      originalname: 'fake.pdf',
      mimetype: 'image/jpeg',
    });

    await expect(service.parseDocument(file)).rejects.toThrow(BadRequestException);
  });

  it('ném BadRequestException khi dung lượng tệp vượt quá 10 MB', async () => {
    const file = createMulterFile({
      originalname: 'oversized.txt',
      mimetype: 'text/plain',
      size: MAX_DOCUMENT_SIZE_BYTES + 1,
    });

    await expect(service.parseDocument(file)).rejects.toThrow(BadRequestException);
  });

  it('ném BadRequestException khi tệp rỗng (0 bytes hoặc chỉ chứa khoảng trắng)', async () => {
    const zeroFile = createMulterFile({
      originalname: 'empty.txt',
      mimetype: 'text/plain',
      buffer: Buffer.alloc(0),
      size: 0,
    });
    await expect(service.parseDocument(zeroFile)).rejects.toThrow(BadRequestException);

    const whitespaceFile = createMulterFile({
      originalname: 'spaces.md',
      mimetype: 'text/markdown',
      buffer: Buffer.from('   \n\t\r\n   ', 'utf-8'),
    });
    await expect(service.parseDocument(whitespaceFile)).rejects.toThrow(BadRequestException);
  });
});
