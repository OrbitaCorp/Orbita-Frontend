import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { CustomersService } from './customers.service';
import { UpsertCustomerDto } from './dto/upsert-customer.dto';
import { CustomerEmailDto } from './dto/customer-email.dto';
import { FindCustomersQueryDto } from './dto/find-customers-query.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('owner', 'admin')
  findAll(@CurrentBusiness() ctx: AuthContext, @Query() query: FindCustomersQueryDto) {
    const member = assertMemberContext(ctx);
    void member;
    void query;
    return { message: 'not implemented' };
  }

  @Get(':id')
  @Roles('owner', 'admin')
  findOne(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    void member;
    void id;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@CurrentBusiness() ctx: AuthContext, @Body() dto: UpsertCustomerDto) {
    const member = assertMemberContext(ctx);
    void member;
    void dto;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: UpsertCustomerDto) {
    const member = assertMemberContext(ctx);
    void member;
    void id;
    void dto;
    return { message: 'not implemented' };
  }

  @Post('email')
  @Roles('owner', 'admin')
  sendEmail(@CurrentBusiness() ctx: AuthContext, @Body() dto: CustomerEmailDto) {
    const member = assertMemberContext(ctx);
    void member;
    void dto;
    return { message: 'not implemented' };
  }
}
