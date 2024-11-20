import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChannelService } from '../../modules/channel/channel.service';
import { Channel } from '../../modules/channel/channel.schema';

@WebSocketGateway(3002, { cors: true }) 
export class ChannelGateway {
  constructor(private channelService: ChannelService) {}

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() channelId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<WsResponse<any>> {
    const channel = await this.channelService.findAllChannels();
    const updatedMembers =
      await this.channelService.getOnlineMembers(channelId);

    socket.join(channelId); // Add the socket to the specific channel room
    socket.emit('channelMembers', updatedMembers); // Emit updated members to the joining client

    socket.broadcast.to(channelId).emit('newMember', socket.id); // Notify other members that a new user has joined the channel
    return { event: 'channelJoined', data: updatedMembers };
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    @MessageBody() channelId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<WsResponse<any>> {
    socket.leave(channelId); // Remove the socket from the channel room
    socket.broadcast.to(channelId).emit('memberLeft', socket.id); // Notify other members that a user has left the channel
    return { event: 'channelLeft', data: null };
  }
}
