import { Body, Controller, Delete, Get, Param, Patch, Post, BadRequestException } from '@nestjs/common';
import { ChannelService } from '../modules/channel/channel.service';
import { Channel } from '../modules/channel/channel.schema';
import { Types } from 'mongoose';
import { CreateChannelDto } from '../modules/channel/dto/create-channel.dto';
import { UpdateChannelDto } from '../modules/channel/dto/update-channel.dto';


@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) { }

  @Post('create')
  async createChannel(@Body() channelData: CreateChannelDto): Promise<Channel> {
    return this.channelService.createChannel(channelData);
  }

  @Get(':id')
  async getChannelById(@Param('id') id: string): Promise<Channel> {
    return this.channelService.getChannelById(new Types.ObjectId(id));
  }

  @Get()
  async getAllChannels(): Promise<Channel[]> {
    return this.channelService.getAllChannels();
  }

  @Patch('update/:id')
  async updateChannel(
    @Param('id') id: string,
    @Body() updateData: UpdateChannelDto,
  ): Promise<Channel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid channel ID');
    }
    const objectId = new Types.ObjectId(id);
    return this.channelService.updateChannel(objectId, updateData);
  }

  @Delete('delete/:id')
  async deleteChannel(@Param('id') id: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid channel ID');
    }
    return this.channelService.deleteChannel(new Types.ObjectId(id));
  }

  @Post(':channelId/add-member')
  async addMember(
    @Param('channelId') channelId: string,
    @Body('ownerId') ownerId: string,
    @Body('userId') userId: string,
  ): Promise<Channel> {
    return this.channelService.addMember(
      new Types.ObjectId(channelId),
      new Types.ObjectId(ownerId),
      new Types.ObjectId(userId),
    );
  }

  @Delete(':channelId/remove-member')
  async removeMember(
    @Param('channelId') channelId: string,
    @Body('ownerId') ownerId: string,
    @Body('userId') userId: string,
  ): Promise<Channel> {
    return this.channelService.removeMember(
      new Types.ObjectId(channelId),
      new Types.ObjectId(ownerId),
      new Types.ObjectId(userId),
    );
  }


}
