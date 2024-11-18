import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  // Handle user connection
  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }

      const decoded = this.jwtService.verify(token);
      socket.data.user = decoded; // Attach the user to the socket
      console.log(`User connected: ${decoded.username}`);
    } catch (error) {
      console.error('Connection failed:', error.message);
      socket.disconnect();
    }
  }

  // Handle disconnection
  handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.data.user?.username || 'unknown'}`);
  }

  // Handle sending messages
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { content: string; receiver?: string; channelId?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Save the message to the database
    const chatMessage = await this.chatService.createChat({
      content: data.content,
      sender: user._id,
      receiver: data.receiver,
      channelId: data.channelId,
    });

    // Emit the message to the appropriate recipient(s)
    if (data.channelId) {
      this.server.to(data.channelId).emit('newMessage', chatMessage);
    } else if (data.receiver) {
      this.server.to(data.receiver).emit('newMessage', chatMessage);
    } else {
      this.server.emit('newMessage', chatMessage); // Fallback: broadcast to all clients
    }

    return chatMessage;
  }

  // Handle retrieving messages by channel
  @SubscribeMessage('getChannelMessages')
  async handleGetChannelMessages(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const messages = await this.chatService.getChatsByChannel(data.channelId);
    return messages;
  }

  // Handle retrieving messages between two users
  @SubscribeMessage('getUserMessages')
  async handleGetUserMessages(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const messages = await this.chatService.getChatsBetweenUsers(
      user._id,
      data.receiverId,
    );
    return messages;
  }
}
