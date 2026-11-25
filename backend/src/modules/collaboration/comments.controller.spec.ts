import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import type { CommentsService, TaskCommentResponse } from './comments.service.js';

describe('CommentsController', () => {
  let controller: CommentsController;
  let findByTaskMock: ReturnType<typeof vi.fn>;
  let createMock: ReturnType<typeof vi.fn>;
  let updateMock: ReturnType<typeof vi.fn>;
  let removeMock: ReturnType<typeof vi.fn>;

  const sampleComment: TaskCommentResponse = {
    id: 'comment-1',
    taskId: 'task-1',
    userId: 'user-1',
    content: 'Xin chào cả team',
    isEdited: false,
    author: {
      id: 'user-1',
      fullName: 'Alice',
      email: 'alice@tasko.dev',
      avatarUrl: null,
    },
    createdAt: new Date('2026-11-25T10:00:00.000Z'),
    updatedAt: new Date('2026-11-25T10:00:00.000Z'),
  };

  beforeEach(() => {
    findByTaskMock = vi.fn();
    createMock = vi.fn();
    updateMock = vi.fn();
    removeMock = vi.fn();

    const serviceMock = {
      findByTask: findByTaskMock,
      create: createMock,
      update: updateMock,
      remove: removeMock,
    } as unknown as CommentsService;

    controller = new CommentsController(serviceMock);
  });

  it('findByTask gọi service.findByTask và trả về danh sách bình luận', async () => {
    findByTaskMock.mockResolvedValue([sampleComment]);

    const result = await controller.findByTask('TASKO', 'task-1');

    expect(findByTaskMock).toHaveBeenCalledWith('TASKO', 'task-1');
    expect(result).toEqual([sampleComment]);
  });

  it('create gọi service.create với userId, projectId, taskId và dto', async () => {
    createMock.mockResolvedValue(sampleComment);

    const result = await controller.create('user-1', 'TASKO', 'task-1', {
      content: 'Xin chào cả team',
    });

    expect(createMock).toHaveBeenCalledWith('TASKO', 'task-1', 'user-1', {
      content: 'Xin chào cả team',
    });
    expect(result).toEqual(sampleComment);
  });

  it('update gọi service.update và truyền lỗi ForbiddenException nếu không phải tác giả', async () => {
    updateMock.mockRejectedValue(
      new ForbiddenException('Chỉ tác giả mới có quyền chỉnh sửa bình luận này'),
    );

    await expect(
      controller.update('user-2', 'TASKO', 'task-1', 'comment-1', { content: 'Sửa' }),
    ).rejects.toThrow(ForbiddenException);
    expect(updateMock).toHaveBeenCalledWith('TASKO', 'task-1', 'comment-1', 'user-2', {
      content: 'Sửa',
    });
  });

  it('remove gọi service.remove và truyền lỗi NotFoundException khi bình luận không tồn tại', async () => {
    removeMock.mockRejectedValue(new NotFoundException('Không tìm thấy bình luận'));

    await expect(
      controller.remove('user-1', 'TASKO', 'task-1', 'missing-id'),
    ).rejects.toThrow(NotFoundException);
    expect(removeMock).toHaveBeenCalledWith('TASKO', 'task-1', 'missing-id', 'user-1');
  });
});
