import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly isConfigured: boolean;

  constructor(private readonly mailerService: MailerService) {
    // Si no hay MAIL_HOST configurado, loguea en vez de intentar mandar.
    this.isConfigured = !!process.env.MAIL_HOST;
  }

  private async sendOrLog(to: string, subject: string, template: string, context: Record<string, any>) {
    if (!this.isConfigured) {
      this.logger.log(`[MAIL STUB] To: ${to} | Subject: ${subject} | Template: ${template} | Data: ${JSON.stringify(context)}`);
      return;
    }
    await this.mailerService.sendMail({ to, subject, template, context });
  }

  // ── Custom (free-form, used by POST /customers/email) ─

  async sendCustomEmail(to: string, subject: string, htmlBody: string) {
    if (!this.isConfigured) {
      this.logger.log(`[MAIL STUB] To: ${to} | Subject: ${subject} | Body: ${htmlBody.substring(0, 200)}`);
      return;
    }
    await this.mailerService.sendMail({ to, subject, html: htmlBody });
  }

  // ── Auth ──────────────────────────────────────────────

  async sendWelcome(to: string, data: { storeName: string }) {
    await this.sendOrLog(to, `Bienvenido a ${data.storeName}`, 'welcome', data);
  }

  async sendPasswordReset(to: string, data: { resetUrl: string; expiresIn: string }) {
    await this.sendOrLog(to, 'Recuperá tu contraseña', 'reset-password', data);
  }

  // ── Members ───────────────────────────────────────────

  async sendMemberInvitation(to: string, data: {
    storeName: string;
    roleName: string;
    panelUrl: string;
    tempPassword: string;
  }) {
    await this.sendOrLog(to, `Te invitaron a gestionar ${data.storeName}`, 'member-invitation', data);
  }

  // ── Orders ────────────────────────────────────────────

  async sendOrderConfirmation(to: string, data: {
    storeName: string;
    orderNumber: number;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }) {
    await this.sendOrLog(to, `Pedido #${data.orderNumber} confirmado`, 'order-confirmation', data);
  }

  async sendOrderShipped(to: string, data: {
    storeName: string;
    orderNumber: number;
    tracking?: string;
  }) {
    await this.sendOrLog(to, `Tu pedido #${data.orderNumber} está en camino`, 'order-shipped', data);
  }

  async sendOrderDelivered(to: string, data: {
    storeName: string;
    orderNumber: number;
  }) {
    await this.sendOrLog(to, `Tu pedido #${data.orderNumber} fue entregado`, 'order-delivered', data);
  }

  // ── Reviews ───────────────────────────────────────────

  async sendReviewRequest(to: string, data: {
    storeName: string;
    productName: string;
    reviewUrl: string;
  }) {
    await this.sendOrLog(to, `¿Qué te pareció tu compra en ${data.storeName}?`, 'review-request', data);
  }

  // ── Returns ───────────────────────────────────────────

  async sendReturnApproved(to: string, data: {
    storeName: string;
    orderNumber: number;
    refundMethod: string;
    amount: number;
  }) {
    await this.sendOrLog(to, `Tu devolución fue aprobada`, 'return-approved', data);
  }

  // ── Subscriptions (negocio → Orbita) ──────────────────

  async sendSubscriptionPaymentFailed(to: string, data: {
    businessName: string;
    amount: number;
    retryDate: string;
    graceDaysLeft: number;
  }) {
    await this.sendOrLog(to, `No pudimos cobrar tu suscripción de Orbita`, 'subscription-payment-failed', data);
  }

  async sendSubscriptionSuspended(to: string, data: {
    businessName: string;
    reactivateUrl: string;
  }) {
    await this.sendOrLog(to, `Tu tienda en Orbita fue suspendida`, 'subscription-suspended', data);
  }
}
