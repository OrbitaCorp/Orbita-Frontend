import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpsertAddressDto } from './dto/upsert-address.dto';

@Controller('me/addresses')
export class AddressesController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    void this.customersService;
    return { message: 'not implemented' };
  }

  @Post()
  create(@Body() dto: UpsertAddressDto) {
    void this.customersService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpsertAddressDto) {
    void this.customersService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    void this.customersService;
    return { message: 'not implemented' };
  }
}
