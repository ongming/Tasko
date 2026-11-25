import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Repository } from 'typeorm';
import {
  AttachmentsService,
  MAX_ATTACHMENT_SIZE_BYTES,
  normalizeMulterFileName,
} from './attachments.service.js';
import type { TaskAttachment } from './entities/task-attachment.entity.js';
import type { Task } from '../tasks/entities/task.entity.js';
import type { Project } from '../projects/entities/project.entity.js';
import { ProjectRole, type ProjectMember } from '../projects/entities/project-member.entity.js';
import type { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';
import type { ICloudinaryService } from '../cloudinary/interfaces/cloudinary-service.interface.js';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let attachmentRepo: Record<string, ReturnType<typeof vi.fn>>;
  let taskRepo: Record<string, ReturnType<typeof vi.fn>>;
  let projectRepo: Record<string, ReturnType<typeof vi.fn>>;
  let projectMemberRepo: Record<string, ReturnType<typeof vi.fn>>;
  let workspaceMemberRepo: Record<string, ReturnType<typeof vi.fn>>;
  let cloudinaryUploadFileMock: ReturnType<typeof vi.fn>;
  let cloudinaryDeleteFileMock: ReturnType<typeof vi.fn>;

  const projectId = '11111111-1111-1111-1111-111111111111';
  const workspaceId = '22222222-2222-2222-2222-222222222222';
  const taskId = '33333333-3333-3333-3333-333333333333';
  const attachmentId = '55555555-5555-5555-5555-555555555555';
  const uploaderId = 'user-uploader';
  const otherUserId = 'user-other';
  const ownerId = 'user-owner';

  const mockProject = {
    id: projectId,
    key: 'TASKO',
    workspace_id: workspaceId,
    owner_id: ownerId,
  } as Project;

  const mockTask = {
    id: taskId,
    project_id: projectId,
    task_key: 'TASKO-10',
  } as Task;

  const createMockAttachment = (overrides: Record<string, unknown> = {}): TaskAttachment =>
    ({
      id: attachmentId,
      task_id: taskId,
      user_id: uploaderId,
      file_name: 'tai-lieu.pdf',
      file_url: 'https://res.cloudinary.com/demo/raw/upload/tasko/attachments/tai-lieu.pdf',
      public_id: 'tasko/attachments/tai-lieu_123',
      resource_type: 'raw',
      mime_type: 'application/pdf',
      file_size: 2048,
      user: {
        id: uploaderId,
        full_name: 'Alice Developer',
        avatar_url: null,
      },
      created_at: new Date('2026-11-25T11:00:00.000Z'),
      ...overrides,
    }) as unknown as TaskAttachment;

  const createMulterFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
    ({
      originalname: 'tai-lieu.pdf',
      mimetype: 'application/pdf',
      size: 2048,
      buffer: Buffer.from('%PDF-1.4 content'),
      ...overrides,
    }) as Express.Multer.File;

  beforeEach(() => {
    attachmentRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };
    taskRepo = { findOne: vi.fn() };
    projectRepo = { findOne: vi.fn() };
    projectMemberRepo = { findOne: vi.fn() };
    workspaceMemberRepo = { findOne: vi.fn() };
    cloudinaryUploadFileMock = vi.fn();
    cloudinaryDeleteFileMock = vi.fn();

    const cloudinaryServiceMock = {
      uploadImage: vi.fn(),
      uploadFile: cloudinaryUploadFileMock,
      deleteFile: cloudinaryDeleteFileMock,
    } as unknown as ICloudinaryService;

    service = new AttachmentsService(
      attachmentRepo as unknown as Repository<TaskAttachment>,
      taskRepo as unknown as Repository<Task>,
      projectRepo as unknown as Repository<Project>,
      projectMemberRepo as unknown as Repository<ProjectMember>,
      workspaceMemberRepo as unknown as Repository<WorkspaceMember>,
      cloudinaryServiceMock,
    );
  });

  describe('normalizeMulterFileName', () => {
    it('khôi phục đúng tên file tiếng Việt UTF-8 bị Multer đọc theo latin1', () => {
      const vietnamese = 'Báo cáo tiến độ tuần 1.pdf';
      const latin1Mangled = Buffer.from(vietnamese, 'utf8').toString('latin1');
      expect(normalizeMulterFileName(latin1Mangled)).toBe(vietnamese);
      expect(normalizeMulterFileName(vietnamese)).toBe(vietnamese);
    });
  });

  describe('findByTask', () => {
    it('trả về danh sách tệp đính kèm sắp xếp DESC kèm thông tin người tải lên', async () => {
      const att = createMockAttachment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      attachmentRepo.find.mockResolvedValue([att]);

      const result = await service.findByTask('TASKO', taskId);

      expect(attachmentRepo.find).toHaveBeenCalledWith({
        where: { task_id: taskId },
        relations: { user: true },
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].fileName).toBe('tai-lieu.pdf');
      expect(result[0].uploader?.fullName).toBe('Alice Developer');
    });

    it('ném NotFoundException (404) khi task không thuộc dự án', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(null);

      await expect(service.findByTask(projectId, 'wrong-task')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upload', () => {
    it('upload tệp hợp lệ lên Cloudinary và lưu metadata vào DB', async () => {
      const file = createMulterFile();
      const saved = createMockAttachment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      cloudinaryUploadFileMock.mockResolvedValue({
        url: saved.file_url,
        publicId: saved.public_id,
        resourceType: 'raw',
      });
      attachmentRepo.create.mockReturnValue(saved);
      attachmentRepo.save.mockResolvedValue(saved);
      attachmentRepo.findOne.mockResolvedValue(saved);

      const result = await service.upload(projectId, taskId, uploaderId, file);

      expect(cloudinaryUploadFileMock).toHaveBeenCalledWith(file, 'tasko/attachments');
      expect(attachmentRepo.save).toHaveBeenCalled();
      expect(result.fileUrl).toBe(saved.file_url);
      expect(result.publicId).toBe(saved.public_id);
    });

    it('chặn tệp vượt quá giới hạn 10 MB', async () => {
      const oversized = createMulterFile({ size: MAX_ATTACHMENT_SIZE_BYTES + 1 });

      await expect(
        service.upload(projectId, taskId, uploaderId, oversized),
      ).rejects.toThrow(BadRequestException);
      expect(cloudinaryUploadFileMock).not.toHaveBeenCalled();
    });

    it('chặn tệp thực thi nguy hiểm (.exe, .sh, .js)', async () => {
      for (const badName of ['malware.exe', 'script.sh', 'payload.js', 'hack.bat']) {
        const badFile = createMulterFile({ originalname: badName });
        await expect(
          service.upload(projectId, taskId, uploaderId, badFile),
        ).rejects.toThrow(BadRequestException);
      }
      expect(cloudinaryUploadFileMock).not.toHaveBeenCalled();
    });

    it('dọn rác trên Cloudinary (deleteFile) khi lưu DB thất bại', async () => {
      const file = createMulterFile();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      cloudinaryUploadFileMock.mockResolvedValue({
        url: 'https://res.cloudinary.com/demo/raw/upload/orphan.pdf',
        publicId: 'tasko/attachments/orphan_999',
        resourceType: 'raw',
      });
      attachmentRepo.create.mockReturnValue(createMockAttachment());
      attachmentRepo.save.mockRejectedValue(new Error('DB connection lost'));
      cloudinaryDeleteFileMock.mockResolvedValue(undefined);

      await expect(
        service.upload(projectId, taskId, uploaderId, file),
      ).rejects.toThrow('DB connection lost');

      expect(cloudinaryDeleteFileMock).toHaveBeenCalledWith(
        'tasko/attachments/orphan_999',
        'raw',
      );
    });
  });

  describe('remove', () => {
    it('cho phép người tải lên tự xóa tệp đính kèm và xóa trên Cloudinary', async () => {
      const att = createMockAttachment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      attachmentRepo.findOne.mockResolvedValue(att);
      attachmentRepo.remove.mockResolvedValue(att);
      cloudinaryDeleteFileMock.mockResolvedValue(undefined);

      const result = await service.remove(projectId, taskId, attachmentId, uploaderId);

      expect(attachmentRepo.remove).toHaveBeenCalledWith(att);
      expect(cloudinaryDeleteFileMock).toHaveBeenCalledWith(att.public_id, 'raw');
      expect(result).toEqual({ deleted: true, id: attachmentId });
    });

    it('cho phép Project Owner xóa tệp của thành viên khác', async () => {
      const att = createMockAttachment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      attachmentRepo.findOne.mockResolvedValue(att);
      attachmentRepo.remove.mockResolvedValue(att);
      cloudinaryDeleteFileMock.mockResolvedValue(undefined);

      const result = await service.remove(projectId, taskId, attachmentId, ownerId);

      expect(result).toEqual({ deleted: true, id: attachmentId });
      expect(cloudinaryDeleteFileMock).toHaveBeenCalledWith(att.public_id, 'raw');
    });

    it('ném ForbiddenException (403) khi thành viên khác không phải Owner/Admin cố xóa', async () => {
      const att = createMockAttachment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      attachmentRepo.findOne.mockResolvedValue(att);
      workspaceMemberRepo.findOne.mockResolvedValue({
        role: WorkspaceRole.MEMBER,
        roleEntity: { name: 'MEMBER', rolePermissions: [] },
      });
      projectMemberRepo.findOne.mockResolvedValue({
        role: ProjectRole.MEMBER,
        roleEntity: { name: 'MEMBER' },
      });

      await expect(
        service.remove(projectId, taskId, attachmentId, otherUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(attachmentRepo.remove).not.toHaveBeenCalled();
      expect(cloudinaryDeleteFileMock).not.toHaveBeenCalled();
    });

    it('ném NotFoundException (404) khi tệp đính kèm không tồn tại', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      attachmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.remove(projectId, taskId, 'missing-att', uploaderId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
