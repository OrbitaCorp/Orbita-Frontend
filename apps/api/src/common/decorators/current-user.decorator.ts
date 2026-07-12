import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthContext } from '../types/auth-context.type';

/** Extrae el contexto completo del usuario autenticado (seteado por AuthGuard). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthContext }>();
    return request.user;
  },
);
