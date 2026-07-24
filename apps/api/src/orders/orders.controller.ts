import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SendReceiptDto } from './dto/send-receipt.dto';

// (Fase 2 — Alex) Las puertas de entrada de los pedidos. Los permisos son los
// del catálogo: ver pedidos (orders.view) para leer, gestionar (orders.manage)
// para crear y cambiar estados — así el contrato de la API se cumple tal cual.
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermission('orders.view')
  findAll(@CurrentBusiness() ctx: AuthContext, @Query() query: FindOrdersQueryDto) {
    const member = assertMemberContext(ctx);
    return this.ordersService.findAll(member.businessId, query);
  }

  @Get(':id')
  @RequirePermission('orders.view')
  findOne(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    return this.ordersService.findOne(member.businessId, id);
  }

  @Post()
  @RequirePermission('orders.manage')
  create(@CurrentBusiness() ctx: AuthContext, @Body() dto: CreateOrderDto) {
    const member = assertMemberContext(ctx);
    return this.ordersService.create(member.businessId, dto);
  }

  @Patch(':id/status')
  @RequirePermission('orders.manage')
  updateStatus(
    @CurrentBusiness() ctx: AuthContext,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const member = assertMemberContext(ctx);
    return this.ordersService.updateStatus(member.businessId, member.memberId, id, dto.status as OrderStatus);
  }

  @Post(':id/receipt')
  @RequirePermission('orders.view')
  receipt(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: SendReceiptDto) {
    const member = assertMemberContext(ctx);
    return this.ordersService.receipt(member.businessId, id, dto.email);
  }
}
