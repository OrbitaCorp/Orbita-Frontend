import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertCustomerContext } from '../common/utils/assert-customer-context';
import { CustomersService } from './customers.service';
import { UpsertAddressDto } from './dto/upsert-address.dto';

@Controller('me/addresses')
export class AddressesController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@CurrentUser() ctx: AuthContext) {
    const customer = assertCustomerContext(ctx);
    void customer;
    return { message: 'not implemented' };
  }

  @Post()
  create(@CurrentUser() ctx: AuthContext, @Body() dto: UpsertAddressDto) {
    const customer = assertCustomerContext(ctx);
    void customer;
    void dto;
    return { message: 'not implemented' };
  }

  @Put(':id')
  update(@CurrentUser() ctx: AuthContext, @Param('id') id: string, @Body() dto: UpsertAddressDto) {
    const customer = assertCustomerContext(ctx);
    void customer;
    void id;
    void dto;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  remove(@CurrentUser() ctx: AuthContext, @Param('id') id: string) {
    const customer = assertCustomerContext(ctx);
    void customer;
    void id;
    return { message: 'not implemented' };
  }
}
