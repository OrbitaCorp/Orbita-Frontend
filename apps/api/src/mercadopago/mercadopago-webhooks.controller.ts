import { Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { MercadopagoService } from './mercadopago.service';

@Controller('webhooks/mercadopago')
export class MercadopagoWebhooksController {
  constructor(private readonly mercadopagoService: MercadopagoService) {}

  @Post('payments')
  @Public()
  paymentsWebhook() {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Post('oauth')
  @Public()
  oauthWebhook() {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }
}
