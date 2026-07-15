import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// businessSlug llega como header X-Business-Slug (ver AuthController), no en el DTO.
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { MailService } from '../mail/mail.service';
import { AuthContext } from '../common/types/auth-context.type';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { LoginResponse } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
    private readonly mail: MailService,
  ) {}

  // ── Register (storefront) ─────────────────────────────────────────────────

  async register(dto: RegisterDto, businessSlug: string): Promise<{ token: string; customer: object }> {
    if (!businessSlug) throw new BadRequestException('Header X-Business-Slug requerido');

    const business = await this.prisma.business.findUnique({
      where: { subdomain: businessSlug },
      include: { storefrontConfig: { select: { storeName: true } } },
    });
    if (!business) throw new NotFoundException('Negocio no encontrado');

    // Crear usuario en Supabase Auth (sin email de confirmación: lo manejamos nosotros).
    const { data: authData, error: signUpError } =
      await this.supabase.adminClient.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
      });
    if (signUpError || !authData.user) {
      throw new BadRequestException(signUpError?.message ?? 'Error al crear usuario');
    }

    const authUserId = authData.user.id;

    // Vincular con customer existente (creado desde POS) o crear uno nuevo.
    const existing = await this.prisma.customer.findFirst({
      where: { businessId: business.id, email: dto.email, deletedAt: null },
    });

    const customer = existing
      ? await this.prisma.customer.update({
          where: { id: existing.id },
          data: { authUserId, firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone },
        })
      : await this.prisma.customer.create({
          data: {
            businessId: business.id,
            authUserId,
            firstName: dto.firstName,
            lastName: dto.lastName ?? null,
            email: dto.email,
            phone: dto.phone ?? null,
          },
        });

    // Obtener session token via signIn con las credenciales recién creadas.
    let signInData: Awaited<ReturnType<typeof this.supabase.adminClient.auth.signInWithPassword>>;
    try {
      signInData = await this.supabase.adminClient.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });
    } catch {
      throw new BadRequestException('Error al iniciar sesión tras el registro');
    }
    const { data: session, error: signInError } = signInData;
    if (signInError || !session.session) {
      throw new BadRequestException('Error al iniciar sesión tras el registro');
    }

    const storeName =
      business.storefrontConfig?.storeName ?? business.name;
    await this.mail.sendWelcome(dto.email, { storeName });

    return { token: session.session.access_token, customer };
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, businessSlug?: string): Promise<LoginResponse> {
    let sessionData: Awaited<ReturnType<typeof this.supabase.adminClient.auth.signInWithPassword>>;
    try {
      sessionData = await this.supabase.adminClient.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });
    } catch {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const { data: session, error } = sessionData;
    if (error || !session.user || !session.session) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const authUserId = session.user.id;
    const token = session.session.access_token;

    // Prioridad: miembro del panel > cliente de storefront.
    const member = await this.prisma.member.findUnique({
      where: { authUserId },
      include: {
        business: true,
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    });

    if (member) {
      return {
        type: 'member' as const,
        token,
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          status: member.status,
        },
        role: member.role.name,
        permissions: member.role.rolePermissions.map((rp) => rp.permission.code),
        business: {
          id: member.business.id,
          name: member.business.name,
          subdomain: member.business.subdomain,
          mode: member.business.mode,
        },
      };
    }

    // Si no es miembro, buscar como cliente en el negocio indicado por el header.
    if (!businessSlug) {
      throw new UnauthorizedException(
        'Usuario sin acceso al panel. Para acceso como cliente enviá el header X-Business-Slug.',
      );
    }

    const business = await this.prisma.business.findUnique({
      where: { subdomain: businessSlug },
    });
    if (!business) throw new UnauthorizedException('Negocio no encontrado');

    const customer = await this.prisma.customer.findFirst({
      where: { authUserId, businessId: business.id, deletedAt: null },
    });
    if (!customer) {
      throw new UnauthorizedException(
        'Usuario sin acceso a ningún negocio. Verificá tus credenciales.',
      );
    }

    return {
      type: 'customer' as const,
      token,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
      business: {
        id: business.id,
        name: business.name,
        subdomain: business.subdomain,
        mode: business.mode,
      },
    };
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout(authUserId: string): Promise<void> {
    // Revoca todas las sesiones del usuario en Supabase.
    await this.supabase.adminClient.auth.admin.signOut(authUserId);
  }

  // ── Forgot password ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    // Generamos el link de recuperación con la Admin API (no enviamos el email de Supabase).
    // Decisión: usamos generateLink + MailService para mantener el branding de Orbita.
    // Esto requiere que en el dashboard de Supabase se deshabilite el email de recovery propio.
    const { data, error } = await this.supabase.adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: dto.email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/reset-password`,
      },
    });
    if (error || !data.properties?.action_link) {
      // No revelamos si el email existe o no (seguridad).
      return;
    }

    await this.mail.sendPasswordReset(dto.email, {
      resetUrl: data.properties.action_link,
      expiresIn: '1 hora',
    });
  }

  // ── Reset password ────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // El token es el access_token extraído del hash de la URL de recuperación.
    const {
      data: { user },
      error,
    } = await this.supabase.adminClient.auth.getUser(dto.token);
    if (error || !user) throw new BadRequestException('Token de recuperación inválido o expirado');

    const { error: updateError } =
      await this.supabase.adminClient.auth.admin.updateUserById(user.id, {
        password: dto.newPassword,
      });
    if (updateError) throw new BadRequestException('No se pudo actualizar la contraseña');
  }

  // ── Accept invitation ─────────────────────────────────────────────────────

  async acceptInvitation(
    dto: AcceptInvitationDto,
  ): Promise<{ token: string; member: object }> {
    // El token es un secreto aleatorio generado en invite() (no el memberId — ver
    // members.service.ts), de un solo uso y con expiración.
    const member = await this.prisma.member.findUnique({
      where: { invitationToken: dto.token },
      include: { business: { select: { name: true } } },
    });

    if (!member || member.status !== 'PENDING' || !member.hasTempPassword) {
      throw new BadRequestException('Invitación inválida o ya aceptada');
    }
    if (!member.invitationTokenExpiresAt || member.invitationTokenExpiresAt < new Date()) {
      throw new BadRequestException('La invitación expiró — pedí que te reinviten');
    }
    if (!member.authUserId) {
      throw new BadRequestException('La invitación no tiene un usuario de Supabase asociado');
    }

    // Actualizar contraseña en Supabase.
    const { error: updateError } =
      await this.supabase.adminClient.auth.admin.updateUserById(member.authUserId, {
        password: dto.newPassword,
      });
    if (updateError) throw new BadRequestException('No se pudo actualizar la contraseña');

    // Activar el member y quemar el token (de un solo uso).
    const activatedMember = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        status: 'ACTIVE',
        hasTempPassword: false,
        invitationToken: null,
        invitationTokenExpiresAt: null,
      },
    });

    // Generar session token.
    let inviteSignIn: Awaited<ReturnType<typeof this.supabase.adminClient.auth.signInWithPassword>>;
    try {
      inviteSignIn = await this.supabase.adminClient.auth.signInWithPassword({
        email: member.email,
        password: dto.newPassword,
      });
    } catch {
      throw new BadRequestException('Error al iniciar sesión tras aceptar la invitación');
    }
    const { data: session, error: signInError } = inviteSignIn;
    if (signInError || !session.session) {
      throw new BadRequestException('Error al iniciar sesión tras aceptar la invitación');
    }

    return {
      token: session.session.access_token,
      member: {
        id: activatedMember.id,
        name: activatedMember.name,
        email: activatedMember.email,
        status: activatedMember.status,
      },
    };
  }

  // ── /me ───────────────────────────────────────────────────────────────────

  async getMe(ctx: AuthContext): Promise<object> {
    if (ctx.type === 'member') {
      const member = await this.prisma.member.findUnique({
        where: { id: ctx.memberId },
        include: {
          business: true,
          role: {
            include: { rolePermissions: { include: { permission: true } } },
          },
        },
      });
      if (!member) throw new UnauthorizedException('Miembro no encontrado');

      return {
        type: 'member',
        member: { id: member.id, name: member.name, email: member.email },
        role: member.role.name,
        permissions: member.role.rolePermissions.map((rp) => rp.permission.code),
        business: {
          id: member.business.id,
          name: member.business.name,
          subdomain: member.business.subdomain,
          mode: member.business.mode,
        },
      };
    }

    // Customer context
    const customer = await this.prisma.customer.findUnique({
      where: { id: ctx.customerId },
      include: { business: true },
    });
    if (!customer) throw new UnauthorizedException('Cliente no encontrado');

    return {
      type: 'customer',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
      business: {
        id: customer.business.id,
        name: customer.business.name,
        subdomain: customer.business.subdomain,
        mode: customer.business.mode,
      },
    };
  }
}

