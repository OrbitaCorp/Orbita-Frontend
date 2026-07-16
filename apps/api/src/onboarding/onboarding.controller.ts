import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { OnboardingService } from './onboarding.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
import { UpdateOnboardingBusinessDto } from './dto/update-onboarding-business.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('rubros')
  @Public()
  getRubros() {
    return this.onboardingService.getRubros();
  }

  @Post('register-business')
  @Public()
  register(@Body() dto: RegisterBusinessDto) {
    return this.onboardingService.registerBusiness(dto);
  }

  @Put('business')
  updateDraft(@CurrentBusiness() ctx: AuthContext, @Body() dto: UpdateOnboardingBusinessDto) {
    const member = assertMemberContext(ctx);
    return this.onboardingService.updateDraft(member.businessId, dto);
  }
}
