import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppRole, ROLES_KEY } from '../decorators/roles.decorator';
import { MemberContext } from '../types/auth-context.type';

interface RequestWithUser {
  user?: { type: string; roleName?: string; permissions?: string[] };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user || user.type !== 'member') {
      throw new ForbiddenException('Solo miembros del equipo pueden acceder a este recurso');
    }

    const member = user as MemberContext;
    if (!requiredRoles.includes(member.roleName as AppRole)) {
      throw new ForbiddenException(
        `Rol requerido: ${requiredRoles.join(' o ')}. Tu rol: ${member.roleName}`,
      );
    }

    return true;
  }
}
