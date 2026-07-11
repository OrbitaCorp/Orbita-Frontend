import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { DomainsService } from './domains.service';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get()
  @Roles('owner', 'admin')
  findAll() {
    void this.domainsService;
    return { message: 'not implemented' };
  }

  @Get('search')
  @Roles('owner', 'admin')
  search() {
    void this.domainsService;
    return { message: 'not implemented' };
  }

  @Post('purchase')
  @Roles('owner')
  purchase(@Body() dto: PurchaseDomainDto) {
    void this.domainsService;
    return { message: 'not implemented' };
  }

  @Post(':id/verify-dns')
  @Roles('owner', 'admin')
  verifyDns(@Param('id') id: string) {
    void this.domainsService;
    return { message: 'not implemented' };
  }

  @Get(':id/ssl-status')
  @Roles('owner', 'admin')
  sslStatus(@Param('id') id: string) {
    void this.domainsService;
    return { message: 'not implemented' };
  }
}
