import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SendReceiptDto } from './dto/send-receipt.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    void this.ordersService;
    return { message: 'not implemented' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    void this.ordersService;
    return { message: 'not implemented' };
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    void this.ordersService;
    return { message: 'not implemented' };
  }

  @Patch(':id/status')
  @Roles('owner', 'admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    void this.ordersService;
    return { message: 'not implemented' };
  }

  @Post(':id/receipt')
  receipt(@Param('id') id: string, @Body() dto: SendReceiptDto) {
    void this.ordersService;
    return { message: 'not implemented' };
  }
}
