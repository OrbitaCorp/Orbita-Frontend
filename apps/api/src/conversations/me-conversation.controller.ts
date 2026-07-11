import { Body, Controller, Get, Post } from '@nestjs/common';
import { FullModeOnly } from '../common/decorators/full-mode-only.decorator';
import { ConversationsService } from './conversations.service';
import { CustomerMessageDto } from './dto/customer-message.dto';

@Controller('me/conversation')
export class MeConversationController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @FullModeOnly()
  myThread() {
    void this.conversationsService;
    return { message: 'not implemented' };
  }

  @Post('messages')
  @FullModeOnly()
  sendMyMessage(@Body() dto: CustomerMessageDto) {
    void this.conversationsService;
    return { message: 'not implemented' };
  }
}
