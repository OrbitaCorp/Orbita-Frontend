import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { InventoryService } from './inventory.service';
import { StockEntryDto } from './dto/stock-entry.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { FindStockQueryDto } from './dto/find-stock-query.dto';
import { FindMovementsQueryDto } from './dto/find-movements-query.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  @RequirePermission('inventory.view')
  stock(@CurrentBusiness() ctx: AuthContext, @Query() query: FindStockQueryDto) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.stock(member.businessId, query);
  }

  @Post('entry')
  @RequirePermission('inventory.manage')
  entry(@CurrentBusiness() ctx: AuthContext, @Body() dto: StockEntryDto) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.entry(member.businessId, member.memberId, dto);
  }

  @Post('adjustment')
  @RequirePermission('inventory.manage')
  adjustment(@CurrentBusiness() ctx: AuthContext, @Body() dto: StockAdjustmentDto) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.adjustment(member.businessId, member.memberId, dto);
  }

  @Get('movements')
  @RequirePermission('inventory.view')
  movements(@CurrentBusiness() ctx: AuthContext, @Query() query: FindMovementsQueryDto) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.movements(member.businessId, query);
  }
}
