import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';

const roleInclude = {
  rolePermissions: { include: { permission: true } },
  _count: { select: { members: true } },
} satisfies Prisma.RoleInclude;

type RoleWithRelations = Prisma.RoleGetPayload<{ include: typeof roleInclude }>;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Roles ────────────────────────────────────────────────────────────────

  async findAll(businessId: string) {
    const roles = await this.prisma.role.findMany({
      where: { businessId },
      include: roleInclude,
      orderBy: { createdAt: 'asc' },
    });
    return roles.map((r) => this.toResponse(r));
  }

  async create(businessId: string, dto: UpsertRoleDto) {
    await this.validatePermissionCodes(dto.permissions);

    const role = await this.prisma.role.create({
      data: {
        businessId,
        name: dto.name,
        description: dto.description ?? null,
        color: dto.color ?? null,
        isDefault: false,
        rolePermissions: {
          create: dto.permissions.map((code) => ({ permission: { connect: { code } } })),
        },
      },
      include: roleInclude,
    });
    return this.toResponse(role);
  }

  async update(businessId: string, id: string, dto: UpsertRoleDto) {
    const role = await this.findOneRaw(businessId, id);
    if (role.isDefault) {
      throw new UnprocessableEntityException('No se puede editar un rol por defecto');
    }
    await this.validatePermissionCodes(dto.permissions);

    // Reemplazo completo de permisos: más simple y predecible que un diff
    // incremental, y el volumen por rol (~19 permisos máx.) lo hace barato.
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description ?? null,
        color: dto.color ?? null,
        rolePermissions: {
          deleteMany: {},
          create: dto.permissions.map((code) => ({ permission: { connect: { code } } })),
        },
      },
      include: roleInclude,
    });
    return this.toResponse(updated);
  }

  async remove(businessId: string, id: string) {
    const role = await this.findOneRaw(businessId, id);
    if (role.isDefault) {
      throw new UnprocessableEntityException('No se puede eliminar un rol por defecto');
    }

    try {
      await this.prisma.role.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new UnprocessableEntityException(
          'No se puede eliminar: hay miembros con este rol asignado',
        );
      }
      throw err;
    }

    return { ok: true };
  }

  // ── Permissions (catálogo global) ───────────────────────────────────────

  findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async findOneRaw(businessId: string, id: string) {
    const role = await this.prisma.role.findFirst({ where: { id, businessId } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  private async validatePermissionCodes(codes: string[]) {
    if (codes.length === 0) return;
    const found = await this.prisma.permission.findMany({ where: { code: { in: codes } } });
    const foundCodes = new Set(found.map((p) => p.code));
    const invalid = codes.filter((c) => !foundCodes.has(c));
    if (invalid.length > 0) {
      throw new BadRequestException(`Permisos inválidos: ${invalid.join(', ')}`);
    }
  }

  private toResponse(role: RoleWithRelations) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      color: role.color,
      isDefault: role.isDefault,
      permissions: role.rolePermissions.map((rp) => rp.permission.code),
      memberCount: role._count.members,
    };
  }
}
