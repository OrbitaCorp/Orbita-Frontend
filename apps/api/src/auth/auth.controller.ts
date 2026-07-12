import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // El negocio se identifica vía X-Business-Slug en TODOS los endpoints —
  // mismo mecanismo que usa AuthGuard para el resto de la API. Requerido
  // en register (siempre storefront); opcional en login (su ausencia = panel).

  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto, @Headers('x-business-slug') businessSlug: string) {
    return this.authService.register(dto, businessSlug);
  }

  @Post('login')
  @Public()
  login(@Body() dto: LoginDto, @Headers('x-business-slug') businessSlug?: string) {
    return this.authService.login(dto, businessSlug);
  }

  @Post('logout')
  logout(@CurrentUser() user: AuthContext) {
    return this.authService.logout(user.authUserId);
  }

  @Post('forgot-password')
  @Public()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('accept-invitation')
  @Public()
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthContext) {
    return this.authService.getMe(user);
  }
}
