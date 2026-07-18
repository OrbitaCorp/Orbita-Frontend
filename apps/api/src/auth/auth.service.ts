import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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

    // Verificar que no exista ya un customer con este email en ESTE negocio.
    const existingCustomer = await this.prisma.customer.findFirst({
      where: { businessId: business.id, email: dto.email, deletedAt: null },
    });
    if (existingCustomer?.authUserId) {
      throw new BadRequestException('Ya tenés cuenta en esta tienda. Iniciá sesión.');
    }

    // getOrCreate en Supabase Auth: si el email ya existe (ej. es dueño de otro
    // negocio), reusar su auth_user_id en vez de fallar.
    const authUserId = await this.getOrCreateSupabaseUser(dto.email, dto.password);

    // Vincular con customer existente (creado desde POS, sin cuenta) o crear nuevo.
    const customer = existingCustomer
      ? await this.prisma.customer.update({
          where: { id: existingCustomer.id },
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

    // Obtener session token.
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

    const storeName = business.storefrontConfig?.storeName ?? business.name;
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

    if (businessSlug) {
      // Login desde un storefront (tienda.orbita.com) — filtrar por ESTE negocio.
      const business = await this.prisma.business.findUnique({
        where: { subdomain: businessSlug },
      });
      if (!business) throw new UnauthorizedException('Negocio no encontrado');

      // Buscar como member de ESTE negocio.
      const member = await this.prisma.member.findFirst({
        where: { authUserId, businessId: business.id },
        include: {
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
            id: business.id,
            name: business.name,
            subdomain: business.subdomain,
            mode: business.mode,
          },
        };
      }

      // No es member de este negocio → buscar como customer de ESTE negocio.
      const customer = await this.prisma.customer.findFirst({
        where: { authUserId, businessId: business.id, deletedAt: null },
      });

      if (!customer) {
        throw new ForbiddenException({
          error: 'NO_ACCOUNT_IN_BUSINESS',
          statusCode: 403,
          message: 'No tenés cuenta en esta tienda. Registrate para continuar.',
        });
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

    // Login sin slug (desde orbita.com/panel) — buscar como member de cualquier negocio.
    // authUserId es @unique en members, así que como máximo hay uno.
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

    throw new ForbiddenException({
      error: 'NO_BUSINESS',
      statusCode: 403,
      message: 'No tenés un negocio registrado. Creá tu tienda para continuar.',
    });
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout(authUserId: string): Promise<void> {
    await this.supabase.adminClient.auth.admin.signOut(authUserId);
  }

  // ── Forgot password ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const { data, error } = await this.supabase.adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: dto.email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/reset-password`,
      },
    });
    if (error || !data.properties?.action_link) {
      return;
    }

    await this.mail.sendPasswordReset(dto.email, {
      resetUrl: data.properties.action_link,
      expiresIn: '1 hora',
    });
  }

  // ── Reset password ────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
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

    const { error: updateError } =
      await this.supabase.adminClient.auth.admin.updateUserById(member.authUserId, {
        password: dto.newPassword,
      });
    if (updateError) throw new BadRequestException('No se pudo actualizar la contraseña');

    const activatedMember = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        status: 'ACTIVE',
        hasTempPassword: false,
        invitationToken: null,
        invitationTokenExpiresAt: null,
      },
    });

    let inviteSignIn: Awaited<ReturnType<typeof this.supabase.adminClient.auth.signInWithPassword>>;
    try {
      inviteSignIn = await this.supabase.adminClient.auth.signInWithPassword({
        email: member.email,
        password: dto.newPassword,
      });
    } catch {
      throw new BadRequestException('Error al iniciar sesión tras aceptar la invitación');
    }
    const { data: sessionData, error: signInError } = inviteSignIn;
    if (signInError || !sessionData.session) {
      throw new BadRequestException('Error al iniciar sesión tras aceptar la invitación');
    }

    return {
      token: sessionData.session.access_token,
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

  // ── Helper: getOrCreate Supabase user ─────────────────────────────────────

  private async getOrCreateSupabaseUser(email: string, password: string): Promise<string> {
    const { data: created, error: createError } =
      await this.supabase.adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (!createError && created.user) return created.user.id;

    // El email ya existe en Supabase → reusar el usuario existente.
    // Esto permite que un dueño de negocio A se registre como cliente en negocio B.
    if (createError?.message?.includes('already') || createError?.status === 422) {
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await this.supabase.adminClient.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (error) throw new BadRequestException('Error buscando usuario en Supabase');
        const found = data.users.find((u) => u.email === email);
        if (found) return found.id;
        if (data.users.length < 200) break;
      }
    }

    throw new BadRequestException(createError?.message ?? 'Error al crear usuario en Supabase');
  }
}
