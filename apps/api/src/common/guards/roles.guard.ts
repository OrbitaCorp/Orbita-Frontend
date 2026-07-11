import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/** Verifica que el miembro tenga el rol/permiso mínimo requerido. STUB: deja pasar todo. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(_context: ExecutionContext): boolean {
    // TODO(auth): comparar los roles de @Roles() contra el rol del req.user.
    void ROLES_KEY;
    void this.reflector;
    return true;
  }
}
