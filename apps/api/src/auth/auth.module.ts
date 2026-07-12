import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// PrismaModule, SupabaseModule y MailModule son @Global() — no hace falta importarlos.
@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
