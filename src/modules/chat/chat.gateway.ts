/* 
    WebSocket gateway for real-time chat 
*/
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      content: string;
      sender: string;
      receiver?: string;
      channelId?: string;
    },
  ) {
    //Store Message to DB
    const chat = await this.chatService.createChat({
      content: data.content,
      sender: new Types.ObjectId(data.sender),
      receiver: data.receiver ? new Types.ObjectId(data.receiver) : null,
      channelId: data.channelId ? new Types.ObjectId(data.channelId) : null,
    });

    if (data.channelId) {
      this.server.to(data.channelId).emit('newMessage', chat);
    } else if (data.receiver) {
      // this.server.to(data.sender).to(data.receiver).emit('newMessage', chat);
      this.server.to(data.receiver).to(data.receiver).emit('newMessage', chat);
    }

    return chat;
  }
}
