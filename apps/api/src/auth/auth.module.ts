import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { GoogleOAuthExchangeStore } from './google-oauth-exchange.store';

@Global()
@Module({
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthService, GoogleAuthService, GoogleOAuthExchangeStore],
  exports: [AuthService],
})
export class AuthModule {}
