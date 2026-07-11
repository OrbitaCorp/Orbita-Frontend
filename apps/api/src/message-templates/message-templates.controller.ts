import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { FullModeOnly } from '../common/decorators/full-mode-only.decorator';
import { MessageTemplatesService } from './message-templates.service';
import { UpsertMessageTemplateDto } from './dto/upsert-message-template.dto';

@Controller('message-templates')
export class MessageTemplatesController {
  constructor(private readonly messageTemplatesService: MessageTemplatesService) {}

  @Get()
  @FullModeOnly()
  findAll() {
    void this.messageTemplatesService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  @FullModeOnly()
  create(@Body() dto: UpsertMessageTemplateDto) {
    void this.messageTemplatesService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  @FullModeOnly()
  update(@Param('id') id: string, @Body() dto: UpsertMessageTemplateDto) {
    void this.messageTemplatesService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  @FullModeOnly()
  remove(@Param('id') id: string) {
    void this.messageTemplatesService;
    return { message: 'not implemented' };
  }
}
