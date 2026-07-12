import { ForbiddenException } from '@nestjs/common';
import { AuthContext, MemberContext } from '../types/auth-context.type';

/**
 * Todos los endpoints de Businesses/Branches son de contexto PANEL. AuthGuard resuelve
 * 'member' o 'customer' según el header X-Business-Slug, pero ninguno de los dos guards
 * (@Roles / BusinessModeGuard) bloquea por sí solo a un customer que llegue a una ruta sin
 * @Roles() explícito. Este helper cierra ese gap.
 */
export function assertMemberContext(ctx: AuthContext): MemberContext {
  if (ctx.type !== 'member') {
    throw new ForbiddenException('Este recurso es exclusivo del panel de administración');
  }
  return ctx;
}
