import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { StockEntryDto } from './dto/stock-entry.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  stock() {
    void this.inventoryService;
    return { message: 'not implemented' };
  }

  @Post('entry')
  @Roles('owner', 'admin')
  entry(@Body() dto: StockEntryDto) {
    void this.inventoryService;
    return { message: 'not implemented' };
  }

  @Post('adjustment')
  @Roles('owner', 'admin')
  adjustment(@Body() dto: StockAdjustmentDto) {
    void this.inventoryService;
    return { message: 'not implemented' };
  }

  @Get('movements')
  movements() {
    void this.inventoryService;
    return { message: 'not implemented' };
  }
}
