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

@WebSocketGateway({ cors: true})
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
    console.log(
      `User disconnected: ${socket.data.user?.username || 'unknown'}`,
    );
  }

  // Handle sending messages
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { content: string; sender: string; receiver?: string; channelId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Log the incoming message data
    console.log(`New message from ${client.data.user.username}: ${data.content}`);
  
    // Call the service method to create a chat and handle real-time notification
    const chat = await this.chatService.createChat(data, this.server);
  
    // Return the chat object (you can also broadcast it here if needed)
    return chat;
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`${client.data.user.username} joined channel ${data.channelId}`);
    client.join(data.channelId); // Join the room
    this.server
      .to(data.channelId)
      .emit('userJoined', { userId: client.data.userId });
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
