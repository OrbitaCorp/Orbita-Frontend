import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthContext } from '../types/auth-context.type';

interface RequestWithUser {
  headers: Record<string, string | undefined>;
  user?: AuthContext;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
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

    let supabaseUser: { id: string } | null = null;
    try {
      const { data, error } = await this.supabase.adminClient.auth.getUser(token);
      if (error || !data.user) throw new UnauthorizedException('Token inválido o expirado');
      supabaseUser = data.user;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Token inválido o expirado');
    }
    const { id: authUserId } = supabaseUser;

    const slug = request.headers['x-business-slug'];

    if (slug) {
      // Con slug: resolver el negocio y buscar SOLO en ese negocio.
      const business = await this.prisma.business.findUnique({
        where: { subdomain: slug },
      });
      if (!business) throw new UnauthorizedException('Negocio no encontrado');

      // Buscar como member de ESTE negocio primero.
      const member = await this.prisma.member.findFirst({
        where: { authUserId, businessId: business.id },
        include: {
          role: {
            include: { rolePermissions: { include: { permission: true } } },
          },
        },
      });

      if (member) {
        request.user = {
          authUserId,
          type: 'member',
          memberId: member.id,
          businessId: business.id,
          businessMode: business.mode,
          roleId: member.roleId,
          roleName: member.role.name,
          permissions: member.role.rolePermissions.map((rp) => rp.permission.code),
        };
        return true;
      }

      // No es member de este negocio → buscar como customer de ESTE negocio.
      const customer = await this.prisma.customer.findFirst({
        where: { authUserId, businessId: business.id, deletedAt: null },
      });
      if (!customer) {
        throw new UnauthorizedException('No tenés cuenta en este negocio');
      }

      request.user = {
        authUserId,
        type: 'customer',
        customerId: customer.id,
        businessId: business.id,
        businessMode: business.mode,
      };
      return true;
    }

    // Sin slug: solo buscar como member (acceso al panel).
    // authUserId es @unique en members, así que como máximo hay uno.
    const member = await this.prisma.member.findUnique({
      where: { authUserId },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
        business: { select: { id: true, mode: true } },
      },
    });

    if (member) {
      request.user = {
        authUserId,
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

    throw new UnauthorizedException(
      'Usuario sin acceso. Para acceso como cliente enviá el header X-Business-Slug.',
    );
  }

  private extractToken(request: RequestWithUser): string | undefined {
    const auth = request.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return undefined;
    return auth.slice(7);
  }
}
