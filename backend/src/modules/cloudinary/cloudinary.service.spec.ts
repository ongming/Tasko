import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PassThrough } from 'node:stream';
import { BadRequestException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service.js';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  const mockConfigService = {
    get: vi.fn((key: string) => {
      if (key === 'CLOUDINARY_CLOUD_NAME') return 'demo-cloud';
      if (key === 'CLOUDINARY_API_KEY') return 'demo-key';
      if (key === 'CLOUDINARY_API_SECRET') return 'demo-secret';
      return undefined;
    }),
  } as unknown as ConfigService;

  const sampleFile = {
    originalname: 'spec.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('%PDF-1.4 sample'),
  } as Express.Multer.File;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CloudinaryService(mockConfigService);
  });

  describe('uploadFile', () => {
    it('tải tệp nguyên bản lên Cloudinary với resource_type: auto và trả về UploadedFileResult', async () => {
      vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(((
        _options: unknown,
        callback: (err: unknown, res?: unknown) => void,
      ) => {
        const stream = new PassThrough();
        stream.on('finish', () => {
          callback(null, {
            secure_url: 'https://res.cloudinary.com/demo/raw/upload/v1/tasko/attachments/spec.pdf',
            public_id: 'tasko/attachments/spec_abc123',
            resource_type: 'raw',
          });
        });
        return stream;
      }) as never);

      const result = await service.uploadFile(sampleFile, 'tasko/attachments');

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'tasko/attachments',
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
        },
        expect.any(Function),
      );
      expect(result).toEqual({
        url: 'https://res.cloudinary.com/demo/raw/upload/v1/tasko/attachments/spec.pdf',
        publicId: 'tasko/attachments/spec_abc123',
        resourceType: 'raw',
      });
    });

    it('ném BadRequestException khi tệp không có buffer', async () => {
      await expect(
        service.uploadFile({} as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException khi Cloudinary trả lỗi upload', async () => {
      vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(((
        _options: unknown,
        callback: (err: unknown, res?: unknown) => void,
      ) => {
        const stream = new PassThrough();
        stream.on('finish', () => {
          callback(new Error('Network error'));
        });
        return stream;
      }) as never);

      await expect(service.uploadFile(sampleFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteFile', () => {
    it('gọi cloudinary.uploader.destroy với đúng publicId và resource_type', async () => {
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' } as never);

      await service.deleteFile('tasko/attachments/spec_abc123', 'image');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'tasko/attachments/spec_abc123',
        { resource_type: 'image' },
      );
    });

    it('mặc định resource_type là raw khi không truyền tham số thứ 2', async () => {
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' } as never);

      await service.deleteFile('tasko/attachments/doc_1');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'tasko/attachments/doc_1',
        { resource_type: 'raw' },
      );
    });
  });
});
