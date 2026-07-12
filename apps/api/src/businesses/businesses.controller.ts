import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { BusinessesService } from './businesses.service';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';
import { UpdateStorefrontConfigDto } from './dto/update-storefront-config.dto';
import { UpdateNotificationConfigDto } from './dto/update-notification-config.dto';
import { PauseBusinessDto } from './dto/pause-business.dto';

@Controller('business')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  getBusiness(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.businessesService.getMe(member.businessId);
  }

  @Put()
  @Roles('owner', 'admin')
  updateBusiness(@CurrentBusiness() ctx: AuthContext, @Body() dto: UpdateBusinessDto) {
    const member = assertMemberContext(ctx);
    return this.businessesService.updateMe(member.businessId, dto);
  }

  @Get('config')
  getConfig(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.businessesService.getConfig(member.businessId);
  }

  @Put('config')
  @Roles('owner', 'admin')
  updateConfig(@CurrentBusiness() ctx: AuthContext, @Body() dto: UpdateBusinessConfigDto) {
    const member = assertMemberContext(ctx);
    return this.businessesService.updateConfig(member.businessId, dto);
  }

  @Get('storefront-config')
  getStorefrontConfig(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.businessesService.getAppearance(member.businessId);
  }

  @Put('storefront-config')
  @Roles('owner', 'admin')
  updateStorefrontConfig(
    @CurrentBusiness() ctx: AuthContext,
    @Body() dto: UpdateStorefrontConfigDto,
  ) {
    const member = assertMemberContext(ctx);
    return this.businessesService.updateAppearance(member.businessId, dto);
  }

  @Get('notification-config')
  getNotificationConfig(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.businessesService.getNotifications(member.businessId);
  }

  @Put('notification-config')
  @Roles('owner', 'admin')
  updateNotificationConfig(
    @CurrentBusiness() ctx: AuthContext,
    @Body() dto: UpdateNotificationConfigDto,
  ) {
    const member = assertMemberContext(ctx);
    return this.businessesService.updateNotifications(member.businessId, dto);
  }

  @Post('publish')
  @Roles('owner', 'admin')
  publish(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.businessesService.publish(member.businessId);
  }

  @Post('pause')
  @Roles('owner')
  pause(@CurrentBusiness() ctx: AuthContext, @Body() dto: PauseBusinessDto) {
    const member = assertMemberContext(ctx);
    return this.businessesService.pause(member.businessId, dto.paused);
  }

  // DELETE /business (eliminar negocio) queda fuera de esta fase: interactúa con
  // `subscriptions` (cancelación) y cascadas que todavía no están implementadas.
  // Ver decisión documentada en el resumen final.
}
