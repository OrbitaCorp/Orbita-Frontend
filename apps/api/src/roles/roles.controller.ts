import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { RolesService } from './roles.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.rolesService.findAll(member.businessId);
  }

  @Post()
  @Roles('owner', 'admin')
  create(@CurrentBusiness() ctx: AuthContext, @Body() dto: UpsertRoleDto) {
    const member = assertMemberContext(ctx);
    return this.rolesService.create(member.businessId, dto);
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: UpsertRoleDto) {
    const member = assertMemberContext(ctx);
    return this.rolesService.update(member.businessId, id, dto);
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    return this.rolesService.remove(member.businessId, id);
  }
}
