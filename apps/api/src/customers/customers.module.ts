import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { AddressesController } from './addresses.controller';
import { CustomersService } from './customers.service';

@Module({
  controllers: [CustomersController, AddressesController],
  providers: [CustomersService],
})
export class CustomersModule {}
