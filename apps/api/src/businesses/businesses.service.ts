import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';
import { UpdateStorefrontConfigDto } from './dto/update-storefront-config.dto';
import { UpdateNotificationConfigDto } from './dto/update-notification-config.dto';

// Set cerrado de eventos y canales válidos para notification_config.matrix.
// No están enumerados como tabla en MODELO_DATOS_DEFINITIVO.md (es un JSON libre),
// así que este catálogo es una decisión tomada acá — ver resumen final.
const NOTIFICATION_EVENTS = [
  'nuevo_pedido',
  'pedido_cancelado',
  'stock_critico',
  'devolucion',
  'pago_confirmado',
  'resumen_diario',
  'cliente_nuevo',
  'reporte_semanal',
] as const;

const NOTIFICATION_CHANNELS = ['panel', 'email', 'whatsapp'] as const;

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Negocio ──────────────────────────────────────────────────────────────

  async getMe(businessId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Negocio no encontrado');
    return this.toBusinessResponse(business);
  }

  async updateMe(businessId: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.update({
      where: { id: businessId },
      data: {
        name: dto.name,
        industry: dto.industry,
        description: dto.description,
      },
    });
    return this.toBusinessResponse(business);
  }

  // Incluye los campos del wizard (RBT-293) para que el frontend pueda
  // rehidratar el estado si el usuario abandona y retoma el onboarding.
  private toBusinessResponse(business: {
    id: string;
    name: string;
    industry: string;
    description: string | null;
    subdomain: string;
    mode: string;
    isActive: boolean;
    isPaused: boolean;
    subrubros: string[];
    teamSize: string | null;
    operatesPhysical: boolean;
    operatesOnline: boolean;
  }) {
    return {
      id: business.id,
      name: business.name,
      industry: business.industry,
      description: business.description,
      subdomain: business.subdomain,
      mode: business.mode,
      isActive: business.isActive,
      isPaused: business.isPaused,
      subrubros: business.subrubros,
      teamSize: business.teamSize,
      operatesPhysical: business.operatesPhysical,
      operatesOnline: business.operatesOnline,
    };
  }

  async publish(businessId: string) {
    const business = await this.prisma.business.update({
      where: { id: businessId },
      data: { isActive: true },
    });
    return { url: `https://${business.subdomain}.orbita.site`, published: business.isActive };
  }

  async pause(businessId: string, paused: boolean) {
    const business = await this.prisma.business.update({
      where: { id: businessId },
      data: { isPaused: paused },
    });
    return { isPaused: business.isPaused };
  }

  // ── Config operativa (contacto, pagos, envíos, redes) ───────────────────

  async getConfig(businessId: string) {
    const config = await this.prisma.businessConfig.findUnique({ where: { businessId } });
    if (!config) throw new NotFoundException('Configuración no encontrada');
    return config;
  }

  async updateConfig(businessId: string, dto: UpdateBusinessConfigDto) {
    const current = await this.prisma.businessConfig.findUnique({ where: { businessId } });
    if (!current) throw new NotFoundException('Configuración no encontrada');

    // Decisión: si el negocio acepta transferencias, transferAlias es obligatorio —
    // sin alias el cajero no tiene dónde decirle al cliente que transfiera. Validación
    // dura (400), no solo advertencia, porque un alias vacío rompe el flujo de cobro.
    const acceptsTransfer = dto.acceptsTransfer ?? current.acceptsTransfer;
    const transferAlias = dto.transferAlias ?? current.transferAlias;
    if (acceptsTransfer && !transferAlias) {
      throw new BadRequestException(
        'transferAlias es obligatorio si acceptsTransfer está habilitado',
      );
    }

    return this.prisma.businessConfig.update({
      where: { businessId },
      data: dto,
    });
  }

  // ── Apariencia del storefront ────────────────────────────────────────────

  async getAppearance(businessId: string) {
    const config = await this.prisma.storefrontConfig.findUnique({ where: { businessId } });
    if (!config) throw new NotFoundException('Configuración de apariencia no encontrada');
    return this.toAppearanceResponse(config);
  }

  async updateAppearance(businessId: string, dto: UpdateStorefrontConfigDto) {
    const current = await this.prisma.storefrontConfig.findUnique({ where: { businessId } });
    if (!current) throw new NotFoundException('Configuración de apariencia no encontrada');

    const { showReviews, heroSlides, headerLinks, ...rest } = dto;
    const config = await this.prisma.storefrontConfig.update({
      where: { businessId },
      data: {
        ...rest,
        ...(showReviews !== undefined ? { showRating: showReviews } : {}),
        ...(heroSlides !== undefined ? { heroSlides: heroSlides as object[] } : {}),
        ...(headerLinks !== undefined ? { headerLinks: headerLinks as object[] } : {}),
      },
    });
    return this.toAppearanceResponse(config);
  }

  // El schema mapea el toggle como `showRating`; la API lo expone como `showReviews`
  // (ver nota en CONTRATO_API.md sobre el renombre showRating → showReviews).
  private toAppearanceResponse(config: {
    showRating: boolean;
    [key: string]: unknown;
  }) {
    const { showRating, ...rest } = config;
    return { ...rest, showReviews: showRating };
  }

  // ── Notificaciones ───────────────────────────────────────────────────────

  async getNotifications(businessId: string) {
    const config = await this.prisma.notificationConfig.findUnique({ where: { businessId } });
    if (!config) throw new NotFoundException('Configuración de notificaciones no encontrada');
    return { matrix: config.matrix };
  }

  async updateNotifications(businessId: string, dto: UpdateNotificationConfigDto) {
    this.validateNotificationMatrix(dto.matrix);

    const config = await this.prisma.notificationConfig.update({
      where: { businessId },
      data: { matrix: dto.matrix },
    });
    return { matrix: config.matrix };
  }

  private validateNotificationMatrix(
    matrix: Record<string, { panel: boolean; email: boolean; whatsapp: boolean }>,
  ) {
    for (const [event, channels] of Object.entries(matrix)) {
      if (!NOTIFICATION_EVENTS.includes(event as (typeof NOTIFICATION_EVENTS)[number])) {
        throw new BadRequestException(
          `Evento de notificación desconocido: "${event}". Eventos válidos: ${NOTIFICATION_EVENTS.join(', ')}`,
        );
      }
      if (typeof channels !== 'object' || channels === null) {
        throw new BadRequestException(`El evento "${event}" debe mapear a un objeto de canales`);
      }
      for (const channel of NOTIFICATION_CHANNELS) {
        if (typeof channels[channel] !== 'boolean') {
          throw new BadRequestException(
            `El evento "${event}" requiere el canal "${channel}" como booleano`,
          );
        }
      }
      const extraKeys = Object.keys(channels).filter(
        (k) => !NOTIFICATION_CHANNELS.includes(k as (typeof NOTIFICATION_CHANNELS)[number]),
      );
      if (extraKeys.length > 0) {
        throw new BadRequestException(
          `Canal(es) desconocido(s) en "${event}": ${extraKeys.join(', ')}. Canales válidos: ${NOTIFICATION_CHANNELS.join(', ')}`,
        );
      }
    }
  }
}
