import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthContext } from '../types/auth-context.type';

/**
 * Extrae el contexto de negocio del request (seteado por AuthGuard).
 * Contiene businessId, businessMode, y — si es member — role y permissions.
 * Alias semántico de @CurrentUser() pensado para endpoints de dominio.
 */
export const CurrentBusiness = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthContext }>();
    return request.user;
  },
);
