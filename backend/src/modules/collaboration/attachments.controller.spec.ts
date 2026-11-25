import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller.js';
import type {
  AttachmentsService,
  TaskAttachmentResponse,
} from './attachments.service.js';

describe('AttachmentsController', () => {
  let controller: AttachmentsController;
  let findByTaskMock: ReturnType<typeof vi.fn>;
  let uploadMock: ReturnType<typeof vi.fn>;
  let removeMock: ReturnType<typeof vi.fn>;

  const sampleAttachment: TaskAttachmentResponse = {
    id: 'att-1',
    taskId: 'task-1',
    userId: 'user-1',
    fileName: 'spec.pdf',
    fileUrl: 'https://res.cloudinary.com/demo/raw/upload/spec.pdf',
    publicId: 'tasko/attachments/spec_1',
    resourceType: 'raw',
    mimeType: 'application/pdf',
    fileSize: 4096,
    uploader: {
      id: 'user-1',
      fullName: 'Alice',
      avatarUrl: null,
    },
    createdAt: new Date('2026-11-25T11:00:00.000Z'),
  };

  beforeEach(() => {
    findByTaskMock = vi.fn();
    uploadMock = vi.fn();
    removeMock = vi.fn();

    const serviceMock = {
      findByTask: findByTaskMock,
      upload: uploadMock,
      remove: removeMock,
    } as unknown as AttachmentsService;

    controller = new AttachmentsController(serviceMock);
  });

  it('findByTask chuyển tiếp tới service và trả về danh sách tệp đính kèm', async () => {
    findByTaskMock.mockResolvedValue([sampleAttachment]);

    const result = await controller.findByTask('TASKO', 'task-1');

    expect(findByTaskMock).toHaveBeenCalledWith('TASKO', 'task-1');
    expect(result).toEqual([sampleAttachment]);
  });

  it('upload chuyển tiếp userId, projectId, taskId và file xuống service', async () => {
    const file = {
      originalname: 'spec.pdf',
      mimetype: 'application/pdf',
      size: 4096,
      buffer: Buffer.from('pdf'),
    } as Express.Multer.File;
    uploadMock.mockResolvedValue(sampleAttachment);

    const result = await controller.upload('user-1', 'TASKO', 'task-1', file);

    expect(uploadMock).toHaveBeenCalledWith('TASKO', 'task-1', 'user-1', file);
    expect(result).toEqual(sampleAttachment);
  });

  it('remove chuyển tiếp lỗi ForbiddenException / NotFoundException từ service', async () => {
    removeMock.mockRejectedValueOnce(new ForbiddenException('Không có quyền'));
    await expect(
      controller.remove('user-2', 'TASKO', 'task-1', 'att-1'),
    ).rejects.toThrow(ForbiddenException);

    removeMock.mockRejectedValueOnce(new NotFoundException('Không tìm thấy'));
    await expect(
      controller.remove('user-1', 'TASKO', 'task-1', 'missing'),
    ).rejects.toThrow(NotFoundException);
  });
});
