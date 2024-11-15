/* 
    WebSocket gateway for real-time chat 
*/
import { 
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
    namespace: '/chat',
    cors: { 
        origin: '*'
    },
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() messageData: { senderId: string; channelId: string; content: string },
  ) { }
}