import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto) {
    void this.authService;
    return { message: 'not implemented' };
  }

  @Post('login')
  @Public()
  login(@Body() dto: LoginDto) {
    void this.authService;
    return { message: 'not implemented' };
  }

  @Post('logout')
  logout() {
    void this.authService;
    return { message: 'not implemented' };
  }

  @Post('forgot-password')
  @Public()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    void this.authService;
    return { message: 'not implemented' };
  }

  @Post('reset-password')
  @Public()
  resetPassword(@Body() dto: ResetPasswordDto) {
    void this.authService;
    return { message: 'not implemented' };
  }

  @Post('accept-invitation')
  @Public()
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    void this.authService;
    return { message: 'not implemented' };
  }

  @Get('me/customer')
  meCustomer() {
    void this.authService;
    return { message: 'not implemented' };
  }

  @Get('me/member')
  meMember() {
    void this.authService;
    return { message: 'not implemented' };
  }
}
