/* 
    MongoDB data access for notifications
*/

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // Enable CORS for all origins
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers: Map<string, string> = new Map(); 

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.activeUsers.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
      }
    });
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.activeUsers.set(userId, client.id);
    console.log(`User registered: ${userId} with socketId: ${client.id}`);
  }

  sendNotification(userId: string, message: string) {
    const socketId = this.activeUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', message);
    } else {
      console.log(`User ${userId} is not connected.`);
    }
  }
}
