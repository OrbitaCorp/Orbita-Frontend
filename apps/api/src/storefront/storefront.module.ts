import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { MeController } from './me.controller';
import { StorefrontService } from './storefront.service';

@Module({
  controllers: [StorefrontController, MeController],
  providers: [StorefrontService],
})
export class StorefrontModule {}
