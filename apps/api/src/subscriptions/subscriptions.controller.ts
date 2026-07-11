import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles('owner', 'admin')
  get() {
    void this.subscriptionsService;
    return { message: 'not implemented' };
  }

  @Get('payments')
  @Roles('owner', 'admin')
  payments() {
    void this.subscriptionsService;
    return { message: 'not implemented' };
  }
}
