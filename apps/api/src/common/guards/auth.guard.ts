import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService, JwtPayload } from '../../auth/auth.service';
import { AuthContext } from '../types/auth-context.type';

interface RequestWithUser {
  headers: Record<string, string | undefined>;
  user?: AuthContext;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Token requerido');

    let payload: JwtPayload;
    try {
      payload = this.authService.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const slug = request.headers['x-business-slug'];

    if (payload.type === 'member') {
      const member = await this.prisma.member.findUnique({
        where: { id: payload.sub },
        include: {
          role: { include: { rolePermissions: { include: { permission: true } } } },
          business: { select: { id: true, mode: true, subdomain: true } },
        },
      });
      if (!member) throw new UnauthorizedException('Token inválido o expirado');

      if (slug && member.business.subdomain !== slug) {
        throw new UnauthorizedException('Token no válido para este negocio');
      }

      request.user = {
        authUserId: member.authUserId ?? member.id,
        type: 'member',
        memberId: member.id,
        businessId: member.businessId,
        businessMode: member.business.mode,
        roleId: member.roleId,
        roleName: member.role.name,
        permissions: member.role.rolePermissions.map((rp) => rp.permission.code),
      };
      return true;
    }

    if (payload.type === 'customer') {
      const customer = await this.prisma.customer.findUnique({
        where: { id: payload.sub },
        include: { business: { select: { id: true, mode: true, subdomain: true } } },
      });
      if (!customer || customer.deletedAt) throw new UnauthorizedException('Token inválido o expirado');

      if (slug && customer.business.subdomain !== slug) {
        throw new UnauthorizedException('Token no válido para este negocio');
      }

      request.user = {
        authUserId: customer.authUserId ?? customer.id,
        type: 'customer',
        customerId: customer.id,
        businessId: customer.businessId,
        businessMode: customer.business.mode,
      };
      return true;
    }

    throw new UnauthorizedException('Token inválido o expirado');
  }

  private extractToken(request: RequestWithUser): string | undefined {
    const auth = request.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return undefined;
    return auth.slice(7);
  }
}
