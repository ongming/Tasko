import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator lấy thông tin user đã xác thực từ `request.user`
 * Cách dùng: `@CurrentUser() user: AuthenticatedUser` hoặc `@CurrentUser('id') userId: string`
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
