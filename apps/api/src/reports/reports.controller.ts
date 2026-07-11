import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    void this.reportsService;
    return { message: 'not implemented' };
  }

  @Get('sales')
  sales() {
    void this.reportsService;
    return { message: 'not implemented' };
  }

  @Get('products')
  products() {
    void this.reportsService;
    return { message: 'not implemented' };
  }

  @Get('customers')
  customers() {
    void this.reportsService;
    return { message: 'not implemented' };
  }

  @Get('inventory')
  inventory() {
    void this.reportsService;
    return { message: 'not implemented' };
  }
}
