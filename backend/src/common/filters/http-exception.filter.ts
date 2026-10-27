import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi máy chủ nội bộ (Internal Server Error)';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, any>;
        // Nếu ValidationPipe trả về mảng các lỗi validation:
        if (Array.isArray(resObj.message)) {
          message = resObj.message.join('; ');
        } else {
          message = resObj.message || exception.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Format error response theo chuẩn AGENT.md: { statusCode, message, data: null }
    response.status(statusCode).json({
      statusCode,
      message,
      data: null,
    });
  }
}
