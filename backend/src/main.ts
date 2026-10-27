import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule, ObserveInstrument } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // 1. Cho phép đọc và ghi HttpOnly Cookie (dành cho Refresh Token)
  app.use(cookieParser());

  // 2. Cấu hình CORS để Frontend React (localhost:5173) có thể trao đổi cookie
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  // 3. Tiền tố toàn cục cho các API: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // 4. ValidationPipe toàn cục theo chuẩn AGENT.md
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 5. Interceptor định dạng response thành công: { statusCode, message, data }
  app.useGlobalInterceptors(new TransformInterceptor());

  // 6. Filter định dạng response lỗi: { statusCode, message, data: null }
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Tasko Backend đang chạy tại: http://localhost:${port}/api/v1`);
}

await bootstrap();
