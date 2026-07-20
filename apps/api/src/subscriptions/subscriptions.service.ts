import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';

// Suscripción del negocio hacia Órbita (no confundir con los pagos de los
// clientes hacia el negocio, que viven en el módulo mercadopago/).
//
// Se usa "preapproval" (Suscripciones de MP) en vez de un pago único porque el
// cobro es recurrente: MP guarda la tarjeta del dueño y le vuelve a cobrar solo
// cada período, sin que tenga que volver a cargar nada. El dueño autoriza el
// débito en una pantalla alojada por MP — nosotros nunca vemos la tarjeta.
//
// El precio y la periodicidad salen de variables de entorno para poder probar
// con montos y ciclos cortos ($1 cada 3 días) sin tocar código. Ver .env.example.

type PlanConfig = {
  amount: number;
  frequency: number;
  frequencyType: 'days' | 'months';
  currency: string;
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private _preapproval: PreApproval | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // Cliente perezoso: si el token no está configurado, la app tiene que poder
  // arrancar igual (el resto del backend no depende de MP).
  private get preapproval(): PreApproval {
    if (!this._preapproval) {
      const accessToken = this.config.get<string>('MP_ACCESS_TOKEN');
      if (!accessToken) {
        throw new BadRequestException(
          'MercadoPago no está configurado en este entorno (falta MP_ACCESS_TOKEN)',
        );
      }
      this._preapproval = new PreApproval(new MercadoPagoConfig({ accessToken }));
    }
    return this._preapproval;
  }

  private get plan(): PlanConfig {
    const frequencyType = this.config.get<string>('MP_SUBSCRIPTION_FREQUENCY_TYPE') ?? 'months';
    if (frequencyType !== 'days' && frequencyType !== 'months') {
      throw new BadRequestException('MP_SUBSCRIPTION_FREQUENCY_TYPE debe ser "days" o "months"');
    }
    return {
      amount: Number(this.config.get<string>('MP_SUBSCRIPTION_AMOUNT') ?? 5000),
      frequency: Number(this.config.get<string>('MP_SUBSCRIPTION_FREQUENCY') ?? 3),
      frequencyType,
      currency: this.config.get<string>('MP_SUBSCRIPTION_CURRENCY') ?? 'ARS',
    };
  }

  private periodEnd(from: Date): Date {
    const { frequency, frequencyType } = this.plan;
    const end = new Date(from);
    if (frequencyType === 'days') end.setDate(end.getDate() + frequency);
    else end.setMonth(end.getMonth() + frequency);
    return end;
  }

  // ── Alta de la suscripción ───────────────────────────────────────────────

  // Devuelve el link de MP al que hay que mandar al dueño para que autorice el
  // débito. No crea la Subscription todavía: recién existe cuando MP confirma
  // que quedó autorizada (ver activateFromPreapproval).
  async startCheckout(businessId: string, memberId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Negocio no encontrado');

    // El pagador es el dueño que está haciendo el alta: MP le manda a ese mail
    // el comprobante de cada cobro.
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Miembro no encontrado');
    const payerEmail = member.email;

    const { amount, frequency, frequencyType, currency } = this.plan;
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

    const response = await this.preapproval.create({
      body: {
        reason: `Órbita — ${business.name}`,
        // Nos permite reconocer a qué negocio corresponde cuando MP nos avisa
        // por webhook, sin depender de que el navegador vuelva.
        external_reference: businessId,
        payer_email: payerEmail,
        back_url: `${frontendUrl}/onboarding/pago-retorno`,
        status: 'pending',
        auto_recurring: {
          frequency,
          frequency_type: frequencyType,
          transaction_amount: amount,
          currency_id: currency,
        },
      },
    });

    if (!response.id || !response.init_point) {
      throw new BadRequestException('MercadoPago no devolvió un link de pago válido');
    }
    return { preapprovalId: response.id, initPoint: response.init_point };
  }

  // ── Confirmación ─────────────────────────────────────────────────────────

  // Le pregunta a MP el estado real de la suscripción y, si quedó autorizada,
  // crea/actualiza la Subscription y publica el negocio. Es idempotente: se
  // llama tanto desde el webhook como desde la vuelta del navegador, y las dos
  // rutas pueden llegar (o no) en cualquier orden.
  async activateFromPreapproval(preapprovalId: string) {
    const mp = await this.preapproval.get({ id: preapprovalId });
    const businessId = mp.external_reference;
    if (!businessId) {
      this.logger.warn(`Preapproval ${preapprovalId} sin external_reference — se ignora`);
      return { status: mp.status ?? 'unknown', activated: false };
    }

    // MP usa 'authorized' cuando el dueño confirmó y el débito quedó activo.
    if (mp.status !== 'authorized') {
      return { status: mp.status ?? 'unknown', activated: false };
    }

    const now = new Date();
    const periodEnd = this.periodEnd(now);
    const { amount, currency } = this.plan;

    const subscription = await this.prisma.subscription.upsert({
      where: { businessId },
      update: {
        status: 'ACTIVE',
        mpPreapprovalId: preapprovalId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        businessId,
        origin: 'PAID',
        status: 'ACTIVE',
        plan: 'starter',
        amount,
        currency,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        mpPreapprovalId: preapprovalId,
      },
    });

    // El negocio se publica recién acá: hasta que el pago no queda autorizado,
    // la tienda no sale al aire (ver PENDIENTES.md).
    const business = await this.prisma.business.update({
      where: { id: businessId },
      data: { isActive: true },
    });

    return {
      status: mp.status,
      activated: true,
      subscriptionId: subscription.id,
      subdomain: business.subdomain,
    };
  }

  // ── Webhook ──────────────────────────────────────────────────────────────

  // MP avisa acá cada vez que la suscripción cambia de estado o se cobra un
  // período. El body varía según el tipo de notificación; nos alcanza con el id
  // del preapproval para volver a preguntarle a MP el estado real (nunca
  // confiamos en el contenido del webhook como fuente de verdad).
  async handleWebhook(body: Record<string, unknown>) {
    const data = body?.data as { id?: string } | undefined;
    const preapprovalId = data?.id ?? (body?.id as string | undefined);
    if (!preapprovalId) {
      this.logger.warn('Webhook de preapproval sin id — se ignora');
      return { received: true };
    }
    try {
      const result = await this.activateFromPreapproval(String(preapprovalId));
      this.logger.log(`Webhook preapproval ${preapprovalId}: ${JSON.stringify(result)}`);
    } catch (err) {
      // Nunca devolvemos error a MP: si respondemos != 2xx reintenta en loop.
      // Queda logueado para revisarlo a mano.
      this.logger.error(`Webhook preapproval ${preapprovalId} falló`, err as Error);
    }
    return { received: true };
  }

  // ── Lectura ──────────────────────────────────────────────────────────────

  async getForBusiness(businessId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { businessId } });
    if (!sub) throw new NotFoundException('Este negocio no tiene una suscripción');
    return {
      id: sub.id,
      origin: sub.origin,
      status: sub.status,
      plan: sub.plan,
      amount: Number(sub.amount),
      currency: sub.currency,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      gracePeriodDays: sub.gracePeriodDays,
      grantReason: sub.grantReason,
    };
  }

  async getPayments(businessId: string, page = 1, limit = 20) {
    const sub = await this.prisma.subscription.findUnique({ where: { businessId } });
    if (!sub) throw new NotFoundException('Este negocio no tiene una suscripción');

    const [items, total] = await Promise.all([
      this.prisma.subscriptionPayment.findMany({
        where: { subscriptionId: sub.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscriptionPayment.count({ where: { subscriptionId: sub.id } }),
    ]);

    return {
      data: items.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        paidAt: p.paidAt,
        failedReason: p.failedReason,
      })),
      total,
      page,
      limit,
    };
  }
}
