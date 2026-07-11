import { Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SubscriptionsService } from './subscriptions.service';

@Controller('webhooks/mercadopago')
export class SubscriptionsWebhookController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('preapproval')
  @Public()
  preapprovalWebhook() {
    void this.subscriptionsService;
    return { message: 'not implemented' };
  }
}
