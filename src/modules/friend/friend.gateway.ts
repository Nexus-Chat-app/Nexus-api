import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class FriendGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendFriendRequest')
  handleFriendRequest(client: Socket, payload: { requester: string, recipient: string }) {
    this.server.emit('friendRequestReceived', payload);
    console.log("you have a new friend request from" , payload.requester);
  }
}