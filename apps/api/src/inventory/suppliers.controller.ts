import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { UpsertSupplierDto } from './dto/upsert-supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    void this.inventoryService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: UpsertSupplierDto) {
    void this.inventoryService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: UpsertSupplierDto) {
    void this.inventoryService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@Param('id') id: string) {
    void this.inventoryService;
    return { message: 'not implemented' };
  }
}
