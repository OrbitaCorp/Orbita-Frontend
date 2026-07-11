import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('orders/:orderId/payments')
  byOrder(@Param('orderId') orderId: string) {
    void this.paymentsService;
    return { message: 'not implemented' };
  }

  @Patch('payments/:id/verify')
  @Roles('owner', 'admin')
  verify(@Param('id') id: string, @Body() dto: VerifyPaymentDto) {
    void this.paymentsService;
    return { message: 'not implemented' };
  }
}
