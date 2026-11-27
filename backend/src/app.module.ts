import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { databaseConfig } from './config/database.config.js';
import { jwtConfig } from './config/jwt.config.js';
import { cloudinaryConfig } from './config/cloudinary.config.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { WorkspacesModule } from './modules/workspaces/workspaces.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { SprintsModule } from './modules/sprints/sprints.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';
import { RbacModule } from './modules/rbac/rbac.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AiDocumentModule } from './modules/ai-document/ai-document.module.js';
import { CollaborationModule } from './modules/collaboration/collaboration.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // 1. Quản lý cấu hình biến môi trường toàn cục (.env) và load các file config riêng
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, jwtConfig, cloudinaryConfig],
    }),
    ScheduleModule.forRoot(),

    // 2. Cấu hình kết nối PostgreSQL qua TypeORM (đọc từ file config riêng biệt)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('database')!,
    }),

    // Observe Telemetry Module có sẵn
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),

    // 3. Phân hệ Xác thực & Quản lý phiên (Auth)
    AuthModule,

    // 4. Phân hệ Quản lý Phân quyền RBAC 2 cấp (Rbac)
    RbacModule,

    // 5. Phân hệ Quản lý Không gian làm việc (Workspaces)
    WorkspacesModule,

    // 6. Phân hệ Quản lý Dự án (Projects)
    ProjectsModule,

    // 7. Phân hệ Quản lý Chu kỳ Sprint (Sprints)
    SprintsModule,

    // 8. Phân hệ Quản lý Công việc / Task (Tasks)
    TasksModule,

    // 9. Phân hệ Quản lý Người dùng & Hồ sơ cá nhân (Users)
    UsersModule,

    // 10. Phân hệ AI Phân tích tài liệu (AiDocument)
    AiDocumentModule,

    // 11. Phân hệ Cộng tác: Bình luận trong Task (Collaboration)
    CollaborationModule,

    // 12. Phân hệ Thông báo & Nhắc hạn định kỳ (Notifications)
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
