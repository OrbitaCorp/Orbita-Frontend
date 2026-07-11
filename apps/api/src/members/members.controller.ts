import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { MembersService } from './members.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll() {
    void this.membersService;
    return { message: 'not implemented' };
  }

  @Post('invite')
  @Roles('owner', 'admin')
  invite(@Body() dto: InviteMemberDto) {
    void this.membersService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    void this.membersService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string) {
    void this.membersService;
    return { message: 'not implemented' };
  }
}
