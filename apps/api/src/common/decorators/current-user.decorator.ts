import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Extrae el usuario autenticado del request (seteado por AuthGuard). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
