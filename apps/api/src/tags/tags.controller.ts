import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { TagsService } from './tags.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll() {
    void this.tagsService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: UpsertTagDto) {
    void this.tagsService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: UpsertTagDto) {
    void this.tagsService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@Param('id') id: string) {
    void this.tagsService;
    return { message: 'not implemented' };
  }
}
