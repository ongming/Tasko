import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Between, Repository } from 'typeorm';
import {
  Notification,
  NotificationDataPayload,
  NotificationType,
} from './entities/notification.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { StatusCategory } from '../projects/entities/status.entity.js';
import { MailService } from '../mail/mail.service.js';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  data?: NotificationDataPayload | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Optional()
    @InjectRepository(Task)
    private readonly taskRepository?: Repository<Task>,
    @Optional()
    private readonly mailService?: MailService,
    @Optional()
    private readonly configService?: ConfigService,
  ) {}

  async getNotifications(userId: string, unreadOnly = false) {
    const where: Record<string, any> = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [items, unreadCount] = await Promise.all([
      this.notificationRepository.find({
        where,
        order: { createdAt: 'DESC' },
        take: 40,
      }),
      this.notificationRepository.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items, unreadCount };
  }

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const entity = this.notificationRepository.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? null,
      isRead: false,
    });
    return this.notificationRepository.save(entity);
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo!');
    }
    if (!notification.isRead) {
      notification.isRead = true;
      return this.notificationRepository.save(notification);
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }

  /**
   * Cron job chạy 07:00 sáng mỗi ngày (giờ VN) để nhắc task hết hạn hôm nay hoặc ngày mai
   */
  @Cron('0 7 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async checkAndNotifyDueSoonTasks(): Promise<{
    checkedCount: number;
    notifiedCount: number;
    emailedUsers: number;
  }> {
    if (!this.taskRepository) {
      return { checkedCount: 0, notifiedCount: 0, emailedUsers: 0 };
    }

    // Tính ngày hôm nay và ngày mai theo UTC+7
    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const nowVn = new Date(Date.now() + vnOffsetMs);
    const todayKey = nowVn.toISOString().split('T')[0];

    const tomorrowVn = new Date(nowVn.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowKey = tomorrowVn.toISOString().split('T')[0];

    const todayStartUtc = new Date(`${todayKey}T00:00:00.000+07:00`);
    const tomorrowEndUtc = new Date(`${tomorrowKey}T23:59:59.999+07:00`);

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.status', 'status')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('project.workspace', 'workspace')
      .where('task.due_date BETWEEN :start AND :end', {
        start: todayStartUtc,
        end: tomorrowEndUtc,
      })
      .andWhere('task.assignee_id IS NOT NULL')
      .andWhere('status.category != :done', { done: StatusCategory.DONE })
      .getMany();

    if (tasks.length === 0) {
      return { checkedCount: 0, notifiedCount: 0, emailedUsers: 0 };
    }

    // Lấy các thông báo DUE_SOON đã tạo hôm nay để tránh gửi trùng
    const endOfTodayUtc = new Date(`${todayKey}T23:59:59.999+07:00`);
    const existingToday = await this.notificationRepository.find({
      where: {
        type: NotificationType.DUE_SOON,
        createdAt: Between(todayStartUtc, endOfTodayUtc),
      },
    });
    const sentSet = new Set(
      existingToday
        .filter((n) => n.data?.taskId && n.data?.remindDate === todayKey)
        .map((n) => `${n.userId}:${n.data!.taskId}`),
    );

    const frontendUrl =
      this.configService?.get<string>('FRONTEND_URL', 'http://localhost:5173') ||
      'http://localhost:5173';

    const digestMap = new Map<
      string,
      {
        email: string;
        name: string;
        items: Array<{
          taskKey: string;
          title: string;
          projectName: string;
          dueDateLabel: string;
          url?: string;
        }>;
      }
    >();

    let notifiedCount = 0;

    for (const t of tasks) {
      if (!t.assignee_id || !t.assignee) continue;
      const dedupKey = `${t.assignee_id}:${t.id}`;
      if (sentSet.has(dedupKey)) continue;

      const workspaceSlug = t.project?.workspace?.slug;
      const projectKey = t.project?.key;
      const dueVnKey = t.due_date
        ? new Date(new Date(t.due_date).getTime() + vnOffsetMs).toISOString().split('T')[0]
        : tomorrowKey;
      const isDueToday = dueVnKey === todayKey;

      await this.createNotification({
        userId: t.assignee_id,
        type: NotificationType.DUE_SOON,
        title: isDueToday
          ? `Đến hạn hôm nay: ${t.task_key}`
          : `Sắp hết hạn: ${t.task_key}`,
        message: isDueToday
          ? `Công việc "${t.title}" sẽ hết hạn trong hôm nay (${todayKey}).`
          : `Công việc "${t.title}" sẽ đến hạn vào ngày mai (${tomorrowKey}).`,
        data: {
          workspaceSlug,
          projectId: t.project_id,
          projectKey,
          taskId: t.id,
          taskKey: t.task_key,
          remindDate: todayKey,
        },
      });
      notifiedCount++;

      if (t.assignee.email) {
        const entry = digestMap.get(t.assignee_id) ?? {
          email: t.assignee.email,
          name: t.assignee.full_name || t.assignee.email,
          items: [],
        };
        const taskUrl =
          workspaceSlug && projectKey
            ? `${frontendUrl}/${workspaceSlug}/${projectKey}/board?taskId=${t.id}`
            : undefined;
        entry.items.push({
          taskKey: t.task_key,
          title: t.title,
          projectName: t.project?.name || projectKey || 'Dự án',
          dueDateLabel: isDueToday ? `Hôm nay (${todayKey})` : `Ngày mai (${tomorrowKey})`,
          url: taskUrl,
        });
        digestMap.set(t.assignee_id, entry);
      }
    }

    let emailedUsers = 0;
    if (this.mailService && digestMap.size > 0) {
      for (const digest of digestMap.values()) {
        await this.mailService.sendDueSoonDigestEmail(
          digest.email,
          digest.name,
          digest.items,
        );
        emailedUsers++;
      }
    }

    this.logger.log(
      `Kiểm tra nhắc hạn (${tomorrowKey}): ${tasks.length} task đến hạn, tạo ${notifiedCount} thông báo, gửi ${emailedUsers} email.`,
    );

    return {
      checkedCount: tasks.length,
      notifiedCount,
      emailedUsers,
    };
  }
}
