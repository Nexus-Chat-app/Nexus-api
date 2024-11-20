import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel } from './channel.schema';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { log } from 'console';

@Injectable()
export class ChannelService {

  constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>) { }

  async createChannel(channelData: CreateChannelDto): Promise<Channel> {
    const existingChannel = await this.channelModel.findOne({ name: channelData.name }).exec();

    if (existingChannel) {
      throw new ConflictException('Channel name already exists');
    }

    const channel = new this.channelModel({
      ...channelData,
      
      owner: new Types.ObjectId(channelData.owner),  
    });

    return channel.save();
  }

  async getChannelById(id: Types.ObjectId): Promise<Channel> {
    const channel = await this.channelModel.findById(id).exec();
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    return channel;
  }

  async getAllChannels(): Promise<Channel[]> {
    return this.channelModel.find().exec();
  }

  async updateChannel(id: Types.ObjectId, updateData: UpdateChannelDto): Promise<Channel> {
    const updatedChannel = await this.channelModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  
    if (!updatedChannel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
  
    return updatedChannel;
  }

  async deleteChannel(id: Types.ObjectId): Promise<{ deleted: boolean }> {
    const result = await this.channelModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    return { deleted: true };
  }

  async addMember(channelId: Types.ObjectId, ownerId: Types.ObjectId, userId: Types.ObjectId): Promise<Channel> {
    const channel = await this.channelModel.findById(channelId).exec();
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }
    if (!channel.owner.equals(ownerId)) {
      throw new ForbiddenException('Only the owner can add members to this channel');
    }
    if (channel.members.includes(userId)) {
      throw new ConflictException('User is already a member of the channel');
    }
    channel.members.push(userId);
    return channel.save();
  }

  async removeMember(
    channelId: Types.ObjectId,
    ownerId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Channel> {
    const channel = await this.channelModel.findById(channelId).exec();

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }
    if (!channel.owner.equals(ownerId)) {
      throw new ForbiddenException('Only the owner can remove members from this channel');
    }
    if (!channel.members.includes(userId)) {
      throw new NotFoundException('User is not a member of this channel');
    }
    channel.members = channel.members.filter((member) => !member.equals(userId));
    return channel.save();
  }

}
