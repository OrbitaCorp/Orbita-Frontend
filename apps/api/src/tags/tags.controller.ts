import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { TagsService } from './tags.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@CurrentBusiness() ctx: AuthContext) {
    const member = assertMemberContext(ctx);
    return this.tagsService.findAll(member.businessId);
  }

  @Post()
  @Roles('owner', 'admin')
  create(@CurrentBusiness() ctx: AuthContext, @Body() dto: UpsertTagDto) {
    const member = assertMemberContext(ctx);
    return this.tagsService.create(member.businessId, dto);
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: UpsertTagDto) {
    const member = assertMemberContext(ctx);
    return this.tagsService.update(member.businessId, id, dto);
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    return this.tagsService.remove(member.businessId, id);
  }
}
