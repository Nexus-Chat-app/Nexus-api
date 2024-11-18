import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
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

  // Handle connection and validate JWT token
  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.headers.authorization?.split(' ')[1]; 

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Decode and verify the JWT token
      const decoded = this.jwtService.verify(token);

      // Attach user data to socket for use in messaging
      socket.user = decoded; 
      console.log(`User connected: ${socket.user._id}`);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Handle incoming messages
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { content: string; receiverId?: string; channelId?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    if (!socket.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const senderId = socket.user._id;  

    // Save the message to the database
    const chatMessage = await this.chatService.createChat({
      content: data.content,
      sender: senderId,
      receiver: data.receiverId, 
      channelId: data.channelId, 
    });

    // Emit the message to the appropriate client or channel
    if (data.channelId) {
      this.server.to(data.channelId).emit('newMessage', chatMessage); // Message for a channel
    } else if (data.receiverId) {
      this.server.to(data.receiverId).emit('newMessage', chatMessage); // Message to a specific user
    } else {
      this.server.emit('newMessage', chatMessage); // Broadcast to all clients
    }

    return chatMessage;
  }

  // Handle disconnection
  async handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
  }
}
