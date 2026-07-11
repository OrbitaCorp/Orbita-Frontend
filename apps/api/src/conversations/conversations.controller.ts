import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FullModeOnly } from '../common/decorators/full-mode-only.decorator';
import { ConversationsService } from './conversations.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @FullModeOnly()
  findAll() {
    void this.conversationsService;
    return { message: 'not implemented' };
  }

  @Get(':id/messages')
  @FullModeOnly()
  messages(@Param('id') id: string) {
    void this.conversationsService;
    return { message: 'not implemented' };
  }

  @Post(':id/messages')
  @FullModeOnly()
  sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto) {
    void this.conversationsService;
    return { message: 'not implemented' };
  }

  @Patch(':id')
  @FullModeOnly()
  update(@Param('id') id: string, @Body() dto: UpdateConversationDto) {
    void this.conversationsService;
    return { message: 'not implemented' };
  }
}
