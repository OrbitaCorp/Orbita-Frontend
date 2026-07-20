import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { SubscriptionsService } from './subscriptions.service';
import { ConfirmSubscriptionDto } from './dto/confirm-subscription.dto';

@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles('owner', 'admin')
  get(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.subscriptionsService.getForBusiness(member.businessId);
  }

  @Get('payments')
  @Roles('owner', 'admin')
  payments(
    @CurrentBusiness() ctx: AuthContext,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const member = assertMemberContext(ctx);
    return this.subscriptionsService.getPayments(
      member.businessId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  // Arranca el alta de la suscripción y devuelve el link de MP. Lo llama el
  // wizard de onboarding con el token del negocio recién creado.
  @Post('checkout')
  @Roles('owner')
  checkout(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.subscriptionsService.startCheckout(member.businessId, member.memberId);
  }

  // Lo llama el frontend cuando MP devuelve al usuario a la app. No confía en
  // lo que venga en la URL: consulta el estado real contra MP.
  @Post('confirm')
  @Roles('owner')
  confirm(@CurrentBusiness() ctx: AuthContext, @Body() dto: ConfirmSubscriptionDto) {
    assertMemberContext(ctx);
    return this.subscriptionsService.activateFromPreapproval(dto.preapprovalId);
  }
}
