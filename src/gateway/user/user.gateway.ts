// user.gateway.ts
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
import { UserService } from '../../modules/user/user.service';
import { User } from '../../modules/user/user.schema';

@WebSocketGateway(3001, { cors: true })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users: Map<string, Socket> = new Map();

  constructor(private userService: UserService) {}

  // Handle user connection
  async handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);

    // Ensure the userId is available in the query string
    const userId = socket.handshake.query.userId;
    if (!userId || (Array.isArray(userId) && userId.length === 0)) {
      console.error('User ID is missing or invalid in the WebSocket handshake');
      socket.disconnect();
      return;
    }

    // If userId is an array, take the first element
    const userIdString = Array.isArray(userId) ? userId[0] : userId;

    const user = await this.userService.findOne(userIdString); // Fetch user by userId directly
    if (user) {
      // Set user as online and emit to all clients
      await this.userService.setUserOnline(user.id, true);
      this.server.emit('userStatus', { userId: user.id, status: true });
    } else {
      console.error(`User with ID ${userIdString} not found`);
      socket.disconnect();
    }
  }

  // Handle user disconnection
  async handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);

    // Ensure the userId is available in the query string
    const userId = socket.handshake.query.userId;
    if (!userId || (Array.isArray(userId) && userId.length === 0)) {
      console.error('User ID is missing or invalid in the WebSocket handshake');
      return; // If no userId, no action needed
    }

    // If userId is an array, take the first element
    const userIdString = Array.isArray(userId) ? userId[0] : userId;

    const user = await this.userService.findOne(userIdString);
    if (user) {
      // Set user as offline and emit to all clients
      await this.userService.setUserOnline(user.id, false);
      this.server.emit('userStatus', { userId: user.id, status: false });
    }
  }

  // Listen for a message from the client
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.emit('newMessage', message); // Broadcast message to all connected clients
  }

  // Emit online friends update when requested
  @SubscribeMessage('getOnlineFriends')
  async getOnlineFriends(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const onlineFriends = await this.userService.getOnlineFriends(userId);
    client.emit('onlineFriends', onlineFriends); // Send list of online friends to the requesting user
  }
}
