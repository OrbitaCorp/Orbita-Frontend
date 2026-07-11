import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { FullModeOnly } from '../common/decorators/full-mode-only.decorator';
import { StorefrontService } from './storefront.service';
import { MeReturnDto } from './dto/me-return.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('me')
export class MeController {
  constructor(private readonly storefrontService: StorefrontService) {}

  @Get('orders')
  @FullModeOnly()
  myOrders() {
    void this.storefrontService;
    return { message: 'not implemented' };
  }

  @Post('orders/:id/return')
  @FullModeOnly()
  requestReturn(@Param('id') id: string, @Body() dto: MeReturnDto) {
    void this.storefrontService;
    return { message: 'not implemented' };
  }

  @Post('orders/:id/cancel')
  @FullModeOnly()
  cancelOrder(@Param('id') id: string) {
    void this.storefrontService;
    return { message: 'not implemented' };
  }

  @Put('profile')
  updateProfile(@Body() dto: UpdateProfileDto) {
    void this.storefrontService;
    return { message: 'not implemented' };
  }
}
