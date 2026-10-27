import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        // Nếu response trả về đã có cấu trúc định sẵn (ví dụ custom message)
        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'message' in result
        ) {
          return {
            statusCode: result.statusCode ?? statusCode,
            message: result.message,
            data: result.data,
          };
        }

        return {
          statusCode,
          message: 'Thành công',
          data: result ?? null,
        };
      }),
    );
  }
}
