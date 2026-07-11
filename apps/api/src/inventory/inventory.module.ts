import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { SuppliersController } from './suppliers.controller';
import { InventoryService } from './inventory.service';

@Module({
  controllers: [InventoryController, SuppliersController],
  providers: [InventoryService],
})
export class InventoryModule {}
