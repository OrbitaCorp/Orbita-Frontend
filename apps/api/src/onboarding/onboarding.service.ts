import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
import { UpdateOnboardingBusinessDto } from './dto/update-onboarding-business.dto';

// ─── Catálogo de rubros (RBT-292/293) ──────────────────────────────────────
// Única fuente de verdad para el selector de rubros del onboarding (antes
// vivía hardcodeado en el frontend, en dos lugares que podían desincronizarse
// — ver PENDIENTES.md). `icon` es un string (nombre de ícono de lucide-react)
// que el frontend mapea localmente a un componente; el backend no puede
// devolver JSX. Solo "tienda" tiene `subrubros` y `disponible: true` — el
// resto son rubros "Próximamente" (roadmap visible, sin funcionalidad real
// todavía), consistente con "por ahora solo Tienda" del contrato original.

const CATEGORIAS = [
  { key: 'tienda', label: 'Tienda & Stock', icon: 'ShoppingBag' },
  { key: 'turnos', label: 'Turnos & Agenda', icon: 'CalendarDays' },
  { key: 'gastro', label: 'Gastronomía', icon: 'UtensilsCrossed' },
  { key: 'servicios', label: 'Servicios', icon: 'Wrench' },
  { key: 'turismo', label: 'Turismo', icon: 'Plane' },
  { key: 'educacion', label: 'Educación', icon: 'GraduationCap' },
  { key: 'eventos', label: 'Eventos', icon: 'PartyPopper' },
] as const;

const TIENDA_SUBRUBROS = [
  { key: 'indumentaria', icon: 'Shirt', label: 'Indumentaria', descripcion: 'Talles, colores y variantes', tipo: 'variantes' },
  { key: 'calzado', icon: 'Footprints', label: 'Calzado', descripcion: 'Numeración y variantes por talle', tipo: 'variantes' },
  { key: 'cosmetica', icon: 'Sparkles', label: 'Perfumería / Cosmética', descripcion: 'Vencimientos y control de lotes', tipo: 'simple' },
  { key: 'electronica', icon: 'Smartphone', label: 'Electrónica', descripcion: 'N° de serie / IMEI por unidad', tipo: 'serie' },
  { key: 'ferreteria', icon: 'Hammer', label: 'Ferretería', descripcion: 'Miles de SKUs, venta por unidad', tipo: 'simple' },
  { key: 'corralon', icon: 'Package2', label: 'Corralón / Construcción', descripcion: 'Venta por m², kg o litro', tipo: 'volumen' },
  { key: 'libreria', icon: 'BookOpen', label: 'Librería', descripcion: 'ISBN, editorial y autor', tipo: 'simple' },
  { key: 'jugueteria', icon: 'Gift', label: 'Juguetería', descripcion: 'Edad recomendada por producto', tipo: 'simple' },
  { key: 'petshop', icon: 'PawPrint', label: 'Pet Shop', descripcion: 'Alimentos por peso y accesorios', tipo: 'volumen' },
  { key: 'repuestos', icon: 'Car', label: 'Repuestos Automotor', descripcion: 'Compatibilidad por modelo de vehículo', tipo: 'serie' },
  { key: 'joyeria', icon: 'Gem', label: 'Joyería', descripcion: 'Materiales, peso y tasación', tipo: 'simple' },
  { key: 'muebleria', icon: 'Sofa', label: 'Mueblería', descripcion: 'Medidas físicas y variantes de color', tipo: 'simple' },
  { key: 'informatica', icon: 'Monitor', label: 'Informática', descripcion: 'Compatibilidades técnicas', tipo: 'serie' },
  { key: 'mayorista', icon: 'Package', label: 'Distribuidora / Mayorista', descripcion: 'Precios escalonados por volumen', tipo: 'volumen' },
  { key: 'limpieza', icon: 'Droplets', label: 'Limpieza', descripcion: 'Litros y concentración', tipo: 'volumen' },
  { key: 'vivero', icon: 'Sprout', label: 'Vivero', descripcion: 'Productos vivos con cuidados especiales', tipo: 'volumen' },
  { key: 'artistica', icon: 'Palette', label: 'Artística / Mercería', descripcion: 'Variantes de color, material y medida', tipo: 'simple' },
  { key: 'detodo', icon: 'Store', label: 'De todo un poco', descripcion: 'Tienda variada sin un rubro fijo', tipo: 'simple' },
] as const;

const RUBROS = [
  { key: 'tienda', icon: 'ShoppingBag', label: 'Tienda Online', descripcion: 'Catálogo, carrito y ventas online', categoria: 'tienda', disponible: true, subrubros: TIENDA_SUBRUBROS },
  { key: 'barberia', icon: 'Scissors', label: 'Barbería / Peluquería', descripcion: 'Múltiples profesionales y agenda', categoria: 'turnos', disponible: false, subrubros: [] },
  { key: 'estetica', icon: 'Sparkles', label: 'Estética / Spa', descripcion: 'Cabinas y salas disponibles', categoria: 'turnos', disponible: false, subrubros: [] },
  { key: 'clinica', icon: 'Hospital', label: 'Clínica / Consultorio', descripcion: 'Historias clínicas y turnos médicos', categoria: 'turnos', disponible: false, subrubros: [] },
  { key: 'odonto', icon: 'Smile', label: 'Odontología', descripcion: 'Tratamientos por etapas', categoria: 'turnos', disponible: false, subrubros: [] },
  { key: 'psico', icon: 'Brain', label: 'Psicología', descripcion: 'Sesiones recurrentes fijas', categoria: 'turnos', disponible: false, subrubros: [] },
  { key: 'gym', icon: 'Dumbbell', label: 'Gimnasio / Personal Trainer', descripcion: 'Cupos por clase y membresías', categoria: 'turnos', disponible: false, subrubros: [] },
  { key: 'foto', icon: 'Camera', label: 'Fotografía / Producción', descripcion: 'Reservas por jornada completa', categoria: 'turnos', disponible: false, subrubros: [] },
  { key: 'rotiseria', icon: 'UtensilsCrossed', label: 'Rotisería / Comidas', descripcion: 'Menú del día, delivery y pedidos', categoria: 'gastro', disponible: false, subrubros: [] },
  { key: 'cafeteria', icon: 'Coffee', label: 'Cafetería / Bar', descripcion: 'Carta digital, pedidos y delivery', categoria: 'gastro', disponible: false, subrubros: [] },
  { key: 'restaurant', icon: 'UtensilsCrossed', label: 'Restaurante', descripcion: 'Reservas de mesa, menú y pedidos', categoria: 'gastro', disponible: false, subrubros: [] },
  { key: 'juridico', icon: 'Scale', label: 'Estudio Jurídico', descripcion: 'Gestión de clientes y casos legales', categoria: 'servicios', disponible: false, subrubros: [] },
  { key: 'coaching', icon: 'Briefcase', label: 'Consultoría / Coaching', descripcion: 'Reuniones online y presenciales', categoria: 'servicios', disponible: false, subrubros: [] },
  { key: 'taller', icon: 'Car', label: 'Taller Mecánico', descripcion: 'Registro de vehículos por cliente', categoria: 'servicios', disponible: false, subrubros: [] },
  { key: 'gomeria', icon: 'Disc3', label: 'Gomería', descripcion: 'Atención rápida y alta rotación', categoria: 'servicios', disponible: false, subrubros: [] },
  { key: 'vet', icon: 'PawPrint', label: 'Veterinaria', descripcion: 'Múltiples mascotas por cliente', categoria: 'servicios', disponible: false, subrubros: [] },
  { key: 'inmobiliaria', icon: 'Home', label: 'Inmobiliaria', descripcion: 'Propiedades, clientes e inquilinos', categoria: 'servicios', disponible: false, subrubros: [] },
  { key: 'turismo', icon: 'Plane', label: 'Turismo / Excursiones', descripcion: 'Paquetes, pasajes y reservas', categoria: 'turismo', disponible: false, subrubros: [] },
  { key: 'hospedaje', icon: 'Hotel', label: 'Hotel / Hospedaje', descripcion: 'Habitaciones, check-in y reservas', categoria: 'turismo', disponible: false, subrubros: [] },
  { key: 'academia', icon: 'GraduationCap', label: 'Academia / Escuela', descripcion: 'Clases, cupos y seguimiento de alumnos', categoria: 'educacion', disponible: false, subrubros: [] },
  { key: 'clases', icon: 'BookOpen', label: 'Clases Particulares', descripcion: 'Agenda de clases y seguimiento', categoria: 'educacion', disponible: false, subrubros: [] },
  { key: 'boliche', icon: 'PartyPopper', label: 'Boliche / Eventos', descripcion: 'Entradas, lista VIP y reservas de mesa', categoria: 'eventos', disponible: false, subrubros: [] },
  { key: 'catering', icon: 'Wine', label: 'Catering', descripcion: 'Presupuestos, fechas y menú personalizado', categoria: 'eventos', disponible: false, subrubros: [] },
] as const;

// ─── Catálogo de permisos + roles default ──────────────────────────────────
// Duplicado deliberado de prisma/seed.ts: seed.ts no es parte del grafo de
// Nest (y prisma/ está excluido del build — ver PENDIENTES.md, bug de
// tsconfig.build.json), así que no se puede importar desde acá sin romper
// la compilación. Si cambia el catálogo, actualizar los dos lugares.

const PERMISSIONS: Array<{ group: string; code: string; label: string }> = [
  { group: 'Pedidos', code: 'orders.view', label: 'Ver pedidos' },
  { group: 'Pedidos', code: 'orders.manage', label: 'Gestionar pedidos' },
  { group: 'Pedidos', code: 'orders.export', label: 'Exportar pedidos' },
  { group: 'Clientes', code: 'customers.view', label: 'Ver clientes' },
  { group: 'Clientes', code: 'customers.manage', label: 'Gestionar clientes' },
  { group: 'Reportes', code: 'reports.view', label: 'Ver reportes' },
  { group: 'Reportes', code: 'reports.export', label: 'Exportar reportes' },
  { group: 'Inventario', code: 'inventory.view', label: 'Ver inventario' },
  { group: 'Inventario', code: 'inventory.manage', label: 'Gestionar inventario' },
  { group: 'POS', code: 'pos.sell', label: 'Vender (POS)' },
  { group: 'POS', code: 'pos.edit_price', label: 'Editar precio en ticket' },
  { group: 'POS', code: 'pos.cash', label: 'Operar caja' },
  { group: 'POS', code: 'pos.cash.manage', label: 'Gestionar sesiones de caja' },
  { group: 'Descuentos', code: 'discounts.view', label: 'Ver descuentos' },
  { group: 'Descuentos', code: 'discounts.manage', label: 'Gestionar descuentos' },
  { group: 'Configuración', code: 'config.edit', label: 'Editar configuración' },
  { group: 'Configuración', code: 'config.team.view', label: 'Ver equipo' },
  { group: 'Configuración', code: 'config.team.manage', label: 'Gestionar equipo' },
  { group: 'Configuración', code: 'config.audit.view', label: 'Ver auditoría' },
  { group: 'Configuración', code: 'config.domains.manage', label: 'Gestionar dominios' },
  { group: 'Catálogo', code: 'catalog.view', label: 'Ver catálogo' },
  { group: 'Catálogo', code: 'catalog.manage', label: 'Gestionar catálogo' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: PERMISSIONS.map((p) => p.code),
  admin: PERMISSIONS.map((p) => p.code),
  cajero: ['pos.sell', 'pos.cash', 'orders.view', 'customers.view', 'discounts.view', 'catalog.view', 'inventory.view', 'config.team.view'],
  empleado: ['orders.view', 'customers.view', 'inventory.view', 'catalog.view', 'config.team.view'],
};

const ROLE_DEFS = [
  { name: 'owner', color: '#000000' },
  { name: 'admin', color: '#4A5568' },
  { name: 'cajero', color: '#2B6CB0' },
  { name: 'empleado', color: '#718096' },
];

const TEMP_SUBDOMAIN_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  // ── RBT-292 ──────────────────────────────────────────────────────────────

  getRubros() {
    return { categorias: CATEGORIAS, rubros: RUBROS };
  }

  // ── RBT-293 — validar subdominio antes de que exista cuenta ─────────────

  async checkSubdomain(subdomain: string) {
    const normalized = (subdomain ?? '').trim().toLowerCase();
    if (!/^[a-z0-9-]{3,63}$/.test(normalized)) {
      return { available: false, reason: 'Formato inválido — solo minúsculas, números y guiones (mínimo 3 caracteres)' };
    }
    const existing = await this.prisma.business.findUnique({ where: { subdomain: normalized } });
    return { available: !existing };
  }

  // ── RBT-291 ──────────────────────────────────────────────────────────────

  async registerBusiness(dto: RegisterBusinessDto) {
    // 1. Usuario de Supabase Auth para el dueño (fuera de la transacción de
    // Prisma: Supabase no participa de esa transacción, y si algo falla del
    // lado de Postgres después, preferimos limpiar el usuario de Auth a mano
    // que dejar la transacción de Postgres abierta esperando una llamada de red).
    const { data: authData, error: authError } = await this.supabase.adminClient.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });
    if (authError || !authData.user) {
      if (authError?.message?.toLowerCase().includes('already been registered')) {
        throw new ConflictException('Ese email ya tiene una cuenta');
      }
      throw new BadRequestException(authError?.message ?? 'Error al crear el usuario');
    }
    const authUserId = authData.user.id;

    const subdomain = await this.generateUniqueSubdomain(dto.businessName);

    // Catálogo global de permisos: upsert idempotente, FUERA de la transacción
    // de negocio — Permission no tiene businessId (es global, no específico de
    // este negocio) y no hay razón para que su escritura sea atómica con la
    // creación del negocio. Mantenerlo afuera también evita que 20 upserts
    // secuenciales coman el timeout de la transacción de abajo (ver
    // PENDIENTES.md — causó un P2028 "Transaction not found" en la primera
    // versión de este método).
    for (const perm of PERMISSIONS) {
      await this.prisma.permission.upsert({ where: { code: perm.code }, update: {}, create: perm });
    }
    const allPermissions = await this.prisma.permission.findMany({
      where: { code: { in: Object.values(ROLE_PERMISSIONS).flat() } },
    });
    const permissionsByCode = new Map(allPermissions.map((p) => [p.code, p]));

    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          const business = await tx.business.create({
            data: {
              name: dto.businessName,
              industry: '', // se completa en el paso de Rubros del wizard (RBT-292)
              subdomain,
              mode: 'FULL',
              isActive: false, // "en configuración" — publish() lo activa al final del wizard
            },
          });

          const branch = await tx.branch.create({
            data: { businessId: business.id, name: 'Principal', isDefault: true },
          });

          const roles: Record<string, { id: string }> = {};
          for (const def of ROLE_DEFS) {
            const role = await tx.role.create({
              data: { businessId: business.id, name: def.name, color: def.color, isDefault: true },
            });
            roles[def.name] = role;

            const codes = ROLE_PERMISSIONS[def.name] ?? [];
            const permissionIds = codes.map((c) => permissionsByCode.get(c)?.id).filter((id): id is string => !!id);
            if (permissionIds.length > 0) {
              await tx.rolePermission.createMany({
                data: permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
              });
            }
          }

          const member = await tx.member.create({
            data: {
              businessId: business.id,
              authUserId,
              name: dto.ownerName,
              email: dto.email,
              roleId: roles.owner.id,
              status: 'ACTIVE',
              hasTempPassword: false,
            },
          });

          await tx.businessConfig.create({
            data: {
              businessId: business.id,
              acceptsMercadopago: true,
              acceptsCash: true,
              acceptsTransfer: false,
              acceptsPickup: true,
            },
          });

          await tx.storefrontConfig.create({
            data: {
              businessId: business.id,
              storeName: dto.businessName,
              colorMode: 'light',
              showRating: true,
              showNewBadge: true,
              showWhatsapp: true,
            },
          });

          await tx.notificationConfig.create({
            data: {
              businessId: business.id,
              matrix: {
                nuevo_pedido: { panel: true, email: true, whatsapp: false },
                pago_confirmado: { panel: true, email: true, whatsapp: false },
              },
            },
          });

          return { business, branch, member, role: roles.owner };
        },
        { timeout: 15000 },
      );

      // 2. Sesión real para que el frontend siga el wizard ya autenticado.
      const { data: session, error: signInError } = await this.supabase.adminClient.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });
      if (signInError || !session.session) {
        throw new BadRequestException('Negocio creado pero no se pudo iniciar sesión automáticamente');
      }

      return {
        token: session.session.access_token,
        business: {
          id: result.business.id,
          name: result.business.name,
          subdomain: result.business.subdomain,
          mode: result.business.mode,
          isActive: result.business.isActive,
        },
        branch: { id: result.branch.id, name: result.branch.name },
        member: { id: result.member.id, name: result.member.name, email: result.member.email },
      };
    } catch (err) {
      // Si la transacción de Postgres falla después de crear el usuario de
      // Supabase, no dejamos un usuario de Auth huérfano sin negocio.
      await this.supabase.adminClient.auth.admin.deleteUser(authUserId).catch(() => {});
      throw err;
    }
  }

  // ── Actualizar datos mientras el negocio sigue "en configuración" ───────

  async updateDraft(businessId: string, dto: UpdateOnboardingBusinessDto) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Negocio no encontrado');
    if (business.isActive) {
      throw new UnprocessableEntityException(
        'El negocio ya está publicado — subdomain y mode no se cambian por esta vía una vez activo',
      );
    }

    try {
      return await this.prisma.business.update({
        where: { id: businessId },
        data: {
          name: dto.name,
          industry: dto.industry,
          description: dto.description,
          subdomain: dto.subdomain,
          mode: dto.mode,
          subrubros: dto.subrubros,
          teamSize: dto.teamSize,
          operatesPhysical: dto.operatesPhysical,
          operatesOnline: dto.operatesOnline,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ese subdominio ya está en uso');
      }
      throw err;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '');
  }

  private async generateUniqueSubdomain(businessName: string): Promise<string> {
    const base = this.slugify(businessName) || 'negocio';
    let candidate = base;
    for (let attempt = 0; attempt < 20; attempt++) {
      const existing = await this.prisma.business.findUnique({ where: { subdomain: candidate } });
      if (!existing) return candidate;
      // Sufijo aleatorio corto — el subdominio final "de verdad" se elige
      // después en el wizard (StepNegocio) vía updateDraft().
      const suffix = Array.from({ length: 4 }, () => TEMP_SUBDOMAIN_CHARS[Math.floor(Math.random() * TEMP_SUBDOMAIN_CHARS.length)]).join('');
      candidate = `${base}-${suffix}`;
    }
    throw new BadRequestException('No se pudo generar un subdominio único, intentá con otro nombre de negocio');
  }
}
