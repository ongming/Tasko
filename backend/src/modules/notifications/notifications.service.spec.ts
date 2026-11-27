import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationsService } from './notifications.service.js';
import { Notification, NotificationType } from './entities/notification.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { MailService } from '../mail/mail.service.js';

describe('NotificationsService - Unit Tests', () => {
  let service: NotificationsService;
  let notificationRepo: any;
  let taskRepo: any;
  let mailService: any;

  const mockQb = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    notificationRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn((data: any) => ({ ...data, id: 'notif-1' })),
      save: vi.fn(async (data: any) => data),
      update: vi.fn().mockResolvedValue(undefined),
    };

    taskRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(mockQb),
    };

    mailService = {
      sendDueSoonDigestEmail: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notificationRepo },
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: { get: vi.fn(() => 'http://localhost:5173') } },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('lấy danh sách thông báo và số lượng chưa đọc', async () => {
    notificationRepo.find.mockResolvedValue([{ id: 'n1', title: 'Test', isRead: false }]);
    notificationRepo.count.mockResolvedValue(1);

    const res = await service.getNotifications('user-1');
    expect(res.items).toHaveLength(1);
    expect(res.unreadCount).toBe(1);
  });

  it('đánh dấu 1 thông báo đã đọc và ném NotFoundException nếu không tồn tại', async () => {
    notificationRepo.findOne.mockResolvedValueOnce({ id: 'n1', userId: 'user-1', isRead: false });
    const updated = await service.markAsRead('user-1', 'n1');
    expect(updated.isRead).toBe(true);

    notificationRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.markAsRead('user-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('đánh dấu tất cả thông báo đã đọc', async () => {
    const res = await service.markAllAsRead('user-1');
    expect(res).toEqual({ success: true });
    expect(notificationRepo.update).toHaveBeenCalledWith(
      { userId: 'user-1', isRead: false },
      { isRead: true },
    );
  });

  it('checkAndNotifyDueSoonTasks gom task hôm nay + ngày mai vào 1 email và bỏ qua task đã nhắc hôm nay', async () => {
    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const todayKey = new Date(Date.now() + vnOffsetMs).toISOString().split('T')[0];

    mockQb.getMany.mockResolvedValue([
      {
        id: 't1',
        task_key: 'PROJ-1',
        title: 'Task 1',
        project_id: 'p1',
        assignee_id: 'u1',
        due_date: new Date(`${todayKey}T00:00:00.000+07:00`),
        assignee: { id: 'u1', email: 'u1@example.com', full_name: 'User One' },
        project: { id: 'p1', key: 'PROJ', name: 'Project A', workspace: { slug: 'ws' } },
      },
      {
        id: 't2',
        task_key: 'PROJ-2',
        title: 'Task 2 (đã nhắc rồi)',
        project_id: 'p1',
        assignee_id: 'u1',
        assignee: { id: 'u1', email: 'u1@example.com', full_name: 'User One' },
        project: { id: 'p1', key: 'PROJ', name: 'Project A', workspace: { slug: 'ws' } },
      },
    ]);

    notificationRepo.find.mockResolvedValue([
      {
        id: 'old-1',
        userId: 'u1',
        type: NotificationType.DUE_SOON,
        data: { taskId: 't2', remindDate: todayKey },
      },
    ]);

    const res = await service.checkAndNotifyDueSoonTasks();
    expect(res.checkedCount).toBe(2);
    expect(res.notifiedCount).toBe(1);
    expect(res.emailedUsers).toBe(1);
    expect(notificationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Đến hạn hôm nay: PROJ-1',
      }),
    );
    expect(mailService.sendDueSoonDigestEmail).toHaveBeenCalledTimes(1);
    expect(mailService.sendDueSoonDigestEmail).toHaveBeenCalledWith(
      'u1@example.com',
      'User One',
      expect.arrayContaining([
        expect.objectContaining({
          taskKey: 'PROJ-1',
          dueDateLabel: `Hôm nay (${todayKey})`,
        }),
      ]),
    );
  });
});
