/* 
    MongoDB operations for chat data 
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatSchema } from './chat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }])],
  providers: [ChatService],
  exports: [ChatService], 
})
export class ChatModule {}
