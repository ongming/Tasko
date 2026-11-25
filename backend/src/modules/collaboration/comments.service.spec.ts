import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { CommentsService } from './comments.service.js';
import type { TaskComment } from './entities/task-comment.entity.js';
import type { Task } from '../tasks/entities/task.entity.js';
import type { Project } from '../projects/entities/project.entity.js';
import { ProjectRole, type ProjectMember } from '../projects/entities/project-member.entity.js';
import type { WorkspaceMember } from '../workspaces/entities/workspace-member.entity.js';
import { WorkspaceRole } from '../workspaces/enums/workspace-role.enum.js';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: Record<string, ReturnType<typeof vi.fn>>;
  let taskRepo: Record<string, ReturnType<typeof vi.fn>>;
  let projectRepo: Record<string, ReturnType<typeof vi.fn>>;
  let projectMemberRepo: Record<string, ReturnType<typeof vi.fn>>;
  let workspaceMemberRepo: Record<string, ReturnType<typeof vi.fn>>;

  const projectId = '11111111-1111-1111-1111-111111111111';
  const workspaceId = '22222222-2222-2222-2222-222222222222';
  const taskId = '33333333-3333-3333-3333-333333333333';
  const commentId = '44444444-4444-4444-4444-444444444444';
  const authorId = 'user-author';
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
    task_key: 'TASKO-1',
    title: 'Implement comments',
  } as Task;

  const mockAuthor = {
    id: authorId,
    full_name: 'Nguyễn Văn A',
    email: 'a@tasko.dev',
    avatar_url: 'https://cdn.tasko.dev/a.png',
  };

  const createMockComment = (overrides: Record<string, unknown> = {}): TaskComment =>
    ({
      id: commentId,
      task_id: taskId,
      user_id: authorId,
      content: 'Bình luận đầu tiên',
      is_edited: false,
      user: mockAuthor,
      created_at: new Date('2026-11-25T10:00:00.000Z'),
      updated_at: new Date('2026-11-25T10:00:00.000Z'),
      deleted_at: null,
      ...overrides,
    }) as unknown as TaskComment;

  const mockComment = createMockComment();

  beforeEach(() => {
    commentRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      softRemove: vi.fn(),
    };
    taskRepo = {
      findOne: vi.fn(),
    };
    projectRepo = {
      findOne: vi.fn(),
    };
    projectMemberRepo = {
      findOne: vi.fn(),
    };
    workspaceMemberRepo = {
      findOne: vi.fn(),
    };

    service = new CommentsService(
      commentRepo as unknown as Repository<TaskComment>,
      taskRepo as unknown as Repository<Task>,
      projectRepo as unknown as Repository<Project>,
      projectMemberRepo as unknown as Repository<ProjectMember>,
      workspaceMemberRepo as unknown as Repository<WorkspaceMember>,
    );
  });

  describe('findByTask', () => {
    it('trả về danh sách bình luận sắp xếp tăng dần kèm tác giả khi truyền project key', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.find.mockResolvedValue([mockComment]);

      const result = await service.findByTask('tasko', taskId);

      expect(projectRepo.findOne).toHaveBeenCalledWith({ where: { key: 'TASKO' } });
      expect(taskRepo.findOne).toHaveBeenCalledWith({
        where: { id: taskId, project_id: projectId },
      });
      expect(commentRepo.find).toHaveBeenCalledWith({
        where: { task_id: taskId },
        relations: { user: true },
        order: { created_at: 'ASC' },
      });
      expect(result).toEqual([
        {
          id: commentId,
          taskId,
          userId: authorId,
          content: 'Bình luận đầu tiên',
          isEdited: false,
          author: {
            id: authorId,
            fullName: 'Nguyễn Văn A',
            email: 'a@tasko.dev',
            avatarUrl: 'https://cdn.tasko.dev/a.png',
          },
          createdAt: mockComment.created_at,
          updatedAt: mockComment.updated_at,
        },
      ]);
    });

    it('ném NotFoundException (404) khi dự án không tồn tại', async () => {
      projectRepo.findOne.mockResolvedValue(null);

      await expect(service.findByTask(projectId, taskId)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException (404) khi task không tồn tại hoặc không thuộc dự án', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(null);

      await expect(service.findByTask(projectId, 'wrong-task')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('tạo bình luận mới thành công và trả về thông tin tác giả', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      const created = createMockComment({ content: 'Nội dung mới' });
      commentRepo.create.mockReturnValue(created);
      commentRepo.save.mockResolvedValue(created);
      commentRepo.findOne.mockResolvedValue(created);

      const result = await service.create(projectId, taskId, authorId, {
        content: '  Nội dung mới  ',
      });

      expect(commentRepo.create).toHaveBeenCalledWith({
        task_id: taskId,
        user_id: authorId,
        content: 'Nội dung mới',
        is_edited: false,
      });
      expect(result.content).toBe('Nội dung mới');
      expect(result.author?.fullName).toBe('Nguyễn Văn A');
      expect(result.isEdited).toBe(false);
    });

    it('ném BadRequestException khi nội dung chỉ có khoảng trắng', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);

      await expect(
        service.create(projectId, taskId, authorId, { content: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('cho phép tác giả sửa bình luận và đánh dấu is_edited = true', async () => {
      const existing = createMockComment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(existing);
      commentRepo.save.mockImplementation(async (c) => c);

      const result = await service.update(projectId, taskId, commentId, authorId, {
        content: '  Đã chỉnh sửa nội dung  ',
      });

      expect(result.content).toBe('Đã chỉnh sửa nội dung');
      expect(result.isEdited).toBe(true);
      expect(commentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: commentId,
          content: 'Đã chỉnh sửa nội dung',
          is_edited: true,
        }),
      );
    });

    it('ném NotFoundException (404) khi bình luận không tồn tại trong task', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(projectId, taskId, 'missing-comment', authorId, { content: 'Sửa' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném ForbiddenException (403) khi người khác cố sửa bình luận của tác giả', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(createMockComment());

      await expect(
        service.update(projectId, taskId, commentId, otherUserId, { content: 'Sửa hộ' }),
      ).rejects.toThrow(
        new ForbiddenException('Chỉ tác giả mới có quyền chỉnh sửa bình luận này'),
      );
    });
  });

  describe('remove', () => {
    it('cho phép tác giả tự xóa mềm bình luận của mình', async () => {
      const existing = createMockComment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(existing);
      commentRepo.softRemove.mockResolvedValue(existing);

      const result = await service.remove(projectId, taskId, commentId, authorId);

      expect(commentRepo.softRemove).toHaveBeenCalledWith(existing);
      expect(result).toEqual({ deleted: true, id: commentId });
    });

    it('cho phép Project Owner xóa mềm bình luận của người khác', async () => {
      const existing = createMockComment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(existing);
      commentRepo.softRemove.mockResolvedValue(existing);

      const result = await service.remove(projectId, taskId, commentId, ownerId);

      expect(commentRepo.softRemove).toHaveBeenCalledWith(existing);
      expect(result).toEqual({ deleted: true, id: commentId });
    });

    it('cho phép Workspace Admin xóa mềm bình luận của người khác', async () => {
      const existing = createMockComment();
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(existing);
      workspaceMemberRepo.findOne.mockResolvedValue({
        role: WorkspaceRole.OWNER,
        roleEntity: null,
      });
      commentRepo.softRemove.mockResolvedValue(existing);

      const result = await service.remove(projectId, taskId, commentId, 'ws-admin');

      expect(commentRepo.softRemove).toHaveBeenCalledWith(existing);
      expect(result).toEqual({ deleted: true, id: commentId });
    });

    it('ném ForbiddenException (403) khi thành viên thường cố xóa bình luận của người khác', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(createMockComment());
      workspaceMemberRepo.findOne.mockResolvedValue({
        role: WorkspaceRole.MEMBER,
        roleEntity: { name: 'MEMBER', rolePermissions: [] },
      });
      projectMemberRepo.findOne.mockResolvedValue({
        role: ProjectRole.MEMBER,
        roleEntity: { name: 'MEMBER' },
      });

      await expect(
        service.remove(projectId, taskId, commentId, otherUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(commentRepo.softRemove).not.toHaveBeenCalled();
    });

    it('ném NotFoundException (404) khi bình luận không tồn tại', async () => {
      projectRepo.findOne.mockResolvedValue(mockProject);
      taskRepo.findOne.mockResolvedValue(mockTask);
      commentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.remove(projectId, taskId, 'missing-id', authorId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
