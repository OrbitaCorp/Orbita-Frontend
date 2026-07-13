import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { InventoryService } from './inventory.service';
import { UpsertSupplierDto } from './dto/upsert-supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.findAllSuppliers(member.businessId);
  }

  @Post()
  @Roles('owner', 'admin')
  create(@CurrentBusiness() ctx: AuthContext, @Body() dto: UpsertSupplierDto) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.createSupplier(member.businessId, dto);
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: UpsertSupplierDto) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.updateSupplier(member.businessId, id, dto);
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    return this.inventoryService.removeSupplier(member.businessId, id);
  }
}
