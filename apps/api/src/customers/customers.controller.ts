import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import { UpsertCustomerDto } from './dto/upsert-customer.dto';
import { CustomerEmailDto } from './dto/customer-email.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    void this.customersService;
    return { message: 'not implemented' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    void this.customersService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: UpsertCustomerDto) {
    void this.customersService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: UpsertCustomerDto) {
    void this.customersService;
    return { message: 'not implemented' };
  }

  @Post('email')
  @Roles('owner', 'admin')
  sendEmail(@Body() dto: CustomerEmailDto) {
    void this.customersService;
    return { message: 'not implemented' };
  }
}
