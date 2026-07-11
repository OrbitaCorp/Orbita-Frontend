import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { MeConversationController } from './me-conversation.controller';
import { ConversationsService } from './conversations.service';

@Module({
  controllers: [ConversationsController, MeConversationController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
