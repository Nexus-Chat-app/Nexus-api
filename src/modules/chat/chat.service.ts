/* 
    Business logic for chat module ( WebSocket handeling  ) 
*/
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';

@Injectable()
export class ChatService {
  constructor( 
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {}

  async createChat(data: { content: string; sender: string; receiver?: string; channelId?: string }) {
    const newChat = new this.chatModel({
      content: data.content,
      sender: new Types.ObjectId(data.sender), 
      receiver: data.receiver ? new Types.ObjectId(data.receiver) : null,
      channelId: data.channelId ? new Types.ObjectId(data.channelId) : null,
      isRead: false,  
    });

    return await newChat.save();
  }

  async getChatsByChannel(channelId: string){
    return this.chatModel
    .find({ channelId: new Types.ObjectId(channelId) })
    .populate('sender', 'username')
    .sort({createdAt: -1})
  }

  async getChatsBetweenUsers(userId1: string, userId2: string){
    return this.chatModel.find({
      $or: [
        { sender: new Types.ObjectId(userId1), receiver: new Types.ObjectId(userId2) },
        { sender: new Types.ObjectId(userId2), receiver: new Types.ObjectId(userId1) }
      ]
    })
    .populate('sender', 'username')
    .sort({createdAt: -1})
  }
}