import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/** Verifica que el usuario sea super-admin de plataforma (fuera del multi-tenant). STUB. */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // TODO(auth): verificar que req.user es un platform_admin activo.
    return true;
  }
}
