/* 
    Group and private channels management
*/

import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ChannelService } from '../modules/channel/channel.service';
import { Channel } from '../modules/channel/channel.schema';
import { User } from '../modules/user/user.schema';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  /**
   * Create a new channel
   */
  @Post('create')
  async createChannel(@Body() channelData: Partial<Channel>): Promise<Channel> {
    return this.channelService.createChannel(channelData);
  }

  /**
   * Get all channels with members
   */
  @Get()
  async findAllChannels(): Promise<Channel[]> {
    return this.channelService.findAllChannels();
  }

  /**
   * Get online members in a specific channel
   */
  @Get(':channelId/online-members')
  async getOnlineMembers(
    @Param('channelId') channelId: string,
  ): Promise<User[]> {
    return this.channelService.getOnlineMembers(channelId);
  }
}
