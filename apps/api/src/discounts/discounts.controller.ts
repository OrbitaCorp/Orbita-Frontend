import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { DiscountsService } from './discounts.service';
import { EvaluateDiscountsDto } from './dto/evaluate-discounts.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { UpsertDiscountDto } from './dto/upsert-discount.dto';
import { SetDiscountLinkDto } from './dto/set-discount-link.dto';
import { SendDiscountLinkDto } from './dto/send-discount-link.dto';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  findAll() {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Get('metrics')
  metrics() {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Post('evaluate')
  evaluate(@Body() dto: EvaluateDiscountsDto) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Post('validate')
  validate(@Body() dto: ValidateCouponDto) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: UpsertDiscountDto) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: UpsertDiscountDto) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Patch(':id/toggle')
  @Roles('owner', 'admin')
  toggle(@Param('id') id: string) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Post(':id/duplicate')
  @Roles('owner', 'admin')
  duplicate(@Param('id') id: string) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@Param('id') id: string) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Get(':id/metrics')
  metricsById(@Param('id') id: string) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Get(':id/audit')
  audit(@Param('id') id: string) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Patch(':id/link')
  @Roles('owner', 'admin')
  setLink(@Param('id') id: string, @Body() dto: SetDiscountLinkDto) {
    void this.discountsService;
    return { message: 'not implemented' };
  }

  @Post(':id/send-link')
  @Roles('owner', 'admin')
  sendLink(@Param('id') id: string, @Body() dto: SendDiscountLinkDto) {
    void this.discountsService;
    return { message: 'not implemented' };
  }
}
