/* 
    Business logic for chat module ( WebSocket handeling  ) 
*/
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async createMessage(messageData: Partial<Chat>): Promise<Chat> {
    const message = new this.chatModel(messageData);
    return message.save();
  }
}