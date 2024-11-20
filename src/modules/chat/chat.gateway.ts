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

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
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
      socket.data.user = decoded;
      console.log(`User connected: ${decoded.username}`);

      // Emit a connection success message to the client
      socket.emit('connected', { message: `Welcome, ${decoded.username}!` });
    } catch (error) {
      console.error('Connection failed:', error.message);
      socket.disconnect(); // Disconnect on failure
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
    data: {
      content: string;
      sender: string;
      receiver?: string;
      channelId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      `New message from ${client.data.user.username}: ${data.content}`,
    );

    // Call the service method to create a chat
    const chat = await this.chatService.createChat(data, this.server);

    // Broadcast the message
    if (data.receiver) {
      // If it is a private message
      this.server.to(data.receiver).emit('newPrivateMessage', {
        content: data.content,
        sender: client.data.user.username,
        timestamp: new Date(),
      });
    }

    if (data.channelId) {
      // If it's a channel message
      this.server.to(data.channelId).emit('newChannelMessage', {
        content: data.content,
        sender: client.data.user.username,
        channelId: data.channelId,
        timestamp: new Date(),
      });
    }

    return chat;
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      `${client.data.user.username} joined channel ${data.channelId}`,
    );
    client.join(data.channelId);

    // Notify other users in the channel
    this.server.to(data.channelId).emit('userJoined', {
      username: client.data.user.username,
      userId: client.data.user._id,
      message: `${client.data.user.username} has joined the channel.`,
    });
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

    try {
      const messages = await this.chatService.getChatsByChannel(data.channelId);
      return messages;
    } catch (error) {
      console.error('Error retrieving channel messages:', error);
      throw new Error('Unable to fetch messages');
    }
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
