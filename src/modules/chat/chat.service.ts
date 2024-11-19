import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';
import { Server } from 'socket.io';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new chat and notify the recipient if applicable
   * @param data Chat message details including sender, receiver, and content
   * @param server WebSocket server instance to emit real-time events
   */
  async createChat(
    data: {
      content: string;
      sender: string;
      receiver?: string;
      channelId?: string;
    },
    server: Server,
  ) 
  
  {
    const newChat = new this.chatModel({
      content: data.content,
      sender: data.sender,
      receiver: data.receiver ? new Types.ObjectId(data.receiver) : null,
      channelId: data.channelId ? new Types.ObjectId(data.channelId) : null,
      isRead: false,
    });

    // Use findOne to get a single user document
    const sender = await this.userModel.findOne({
      _id: new Types.ObjectId(newChat.sender),
    });
    // Check if the user was found
    // if (sender) {
    //   console.log(`New message from ${sender.username}: ${data.content}`);
    // } else {
    //   console.log(`Sender with ID ${newChat.sender} not found.`);
    // }

    // Save the chat message to the database
    const savedChat = await newChat.save();

    // After saving, emit the real-time notification via WebSocket
    if (data.channelId) {
      // If the message is for a channel, broadcast to all users in the channel
      server.to(data.channelId).emit('newMessage', savedChat);
      console.log(`New message in channel ${data.channelId}: ${data.content}`);
    } else if (data.receiver) {
      // If the message is to a specific receiver, emit to both the sender and the receiver
      server.to(data.receiver).to(data.sender).emit('newMessage', savedChat);
      console.log(`New message from ${sender.username} to ${data.receiver}: ${data.content}`);
    }

    return savedChat;
  }

  // Retrieve all messages by channel
  async getChatsByChannel(channelId: string) {
    return this.chatModel
      .find({ channelId: new Types.ObjectId(channelId) })
      .populate('sender', 'username')
      .sort({ createdAt: -1 });
  }

  // Retrieve messages between two users
  async getChatsBetweenUsers(userId1: string, userId2: string) {
    return this.chatModel
      .find({
        $or: [
          {
            sender: new Types.ObjectId(userId1),
            receiver: new Types.ObjectId(userId2),
          },
          {
            sender: new Types.ObjectId(userId2),
            receiver: new Types.ObjectId(userId1),
          },
        ],
      })
      .populate('sender', 'username')
      .sort({ createdAt: -1 });
  }
}
