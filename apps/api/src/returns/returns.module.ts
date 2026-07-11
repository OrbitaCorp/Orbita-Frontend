import { Module } from '@nestjs/common';
import { ReturnsController } from './returns.controller';
import { CreditNotesController } from './credit-notes.controller';
import { ReturnsService } from './returns.service';

@Module({
  controllers: [ReturnsController, CreditNotesController],
  providers: [ReturnsService],
})
export class ReturnsModule {}
