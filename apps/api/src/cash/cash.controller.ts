import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CashService } from './cash.service';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
import { CashMovementDto } from './dto/cash-movement.dto';

@Controller('cash-sessions')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Post()
  open(@Body() dto: OpenCashSessionDto) {
    void this.cashService;
    return { message: 'not implemented' };
  }

  @Get('current')
  current() {
    void this.cashService;
    return { message: 'not implemented' };
  }

  @Get()
  history() {
    void this.cashService;
    return { message: 'not implemented' };
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Body() dto: CloseCashSessionDto) {
    void this.cashService;
    return { message: 'not implemented' };
  }

  @Post(':id/force-close')
  @Roles('owner', 'admin')
  forceClose(@Param('id') id: string) {
    void this.cashService;
    return { message: 'not implemented' };
  }

  @Get(':id/summary')
  summary(@Param('id') id: string) {
    void this.cashService;
    return { message: 'not implemented' };
  }

  @Post(':id/movements')
  addMovement(@Param('id') id: string, @Body() dto: CashMovementDto) {
    void this.cashService;
    return { message: 'not implemented' };
  }
}
