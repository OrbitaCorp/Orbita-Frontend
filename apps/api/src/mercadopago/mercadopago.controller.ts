import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { MercadopagoService } from './mercadopago.service';
import { CreateMpStoreDto } from './dto/create-mp-store.dto';
import { CreateMpPosDto } from './dto/create-mp-pos.dto';
import { SetDeviceModeDto } from './dto/set-device-mode.dto';
import { CreateMpOrderDto } from './dto/create-mp-order.dto';

@Controller('mercadopago')
export class MercadopagoController {
  constructor(private readonly mercadopagoService: MercadopagoService) {}

  @Get('oauth/connect')
  @Roles('owner', 'admin')
  connect() {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Get('oauth/callback')
  @Public()
  callback() {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Post('oauth/disconnect')
  @Roles('owner', 'admin')
  disconnect() {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Get('status')
  status() {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Post('point/stores')
  @Roles('owner', 'admin')
  createStore(@Body() dto: CreateMpStoreDto) {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Post('point/pos')
  @Roles('owner', 'admin')
  createPos(@Body() dto: CreateMpPosDto) {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Get('point/devices')
  @Roles('owner', 'admin')
  listDevices() {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Patch('point/devices/:id/mode')
  @Roles('owner', 'admin')
  setDeviceMode(@Param('id') id: string, @Body() dto: SetDeviceModeDto) {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }

  @Post('orders')
  createMpOrder(@Body() dto: CreateMpOrderDto) {
    void this.mercadopagoService;
    return { message: 'not implemented' };
  }
}
