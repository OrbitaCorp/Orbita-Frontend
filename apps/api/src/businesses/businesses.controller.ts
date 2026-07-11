import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
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
  getBusiness() {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Put()
  @Roles('owner', 'admin')
  updateBusiness(@Body() dto: UpdateBusinessDto) {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Get('config')
  getConfig() {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Put('config')
  @Roles('owner', 'admin')
  updateConfig(@Body() dto: UpdateBusinessConfigDto) {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Get('storefront-config')
  getStorefrontConfig() {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Put('storefront-config')
  @Roles('owner', 'admin')
  updateStorefrontConfig(@Body() dto: UpdateStorefrontConfigDto) {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Get('notification-config')
  getNotificationConfig() {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Put('notification-config')
  @Roles('owner', 'admin')
  updateNotificationConfig(@Body() dto: UpdateNotificationConfigDto) {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Post('publish')
  @Roles('owner', 'admin')
  publish() {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Post('pause')
  @Roles('owner')
  pause(@Body() dto: PauseBusinessDto) {
    void this.businessesService;
    return { message: 'not implemented' };
  }

  @Delete()
  @Roles('owner')
  remove() {
    void this.businessesService;
    return { message: 'not implemented' };
  }
}
