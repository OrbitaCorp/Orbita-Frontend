import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { MembersService } from './members.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.membersService.findAll(member.businessId);
  }

  @Post('invite')
  @Roles('owner', 'admin')
  invite(@CurrentBusiness() ctx: AuthContext, @Body() dto: InviteMemberDto) {
    const member = assertMemberContext(ctx);
    return this.membersService.invite(member.businessId, dto);
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: UpdateMemberDto) {
    const member = assertMemberContext(ctx);
    return this.membersService.update(member.businessId, id, dto);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    return this.membersService.remove(member.businessId, id);
  }
}
