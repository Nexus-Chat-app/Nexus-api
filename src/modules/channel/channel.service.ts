/* 
    This file is responsible for handling all the business logic of the channel module.
    It contains all the methods that are required to perform CRUD operations on the channels.
*/
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel } from './channel.schema';
import { User } from '../user/user.schema';


@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    const channel = new this.channelModel(channelData);
    return channel.save();
  }

  async getOnlineMembers(channelId: string): Promise<User[]> {
    // Fetch channel details
    const channel = await this.channelModel
      .findById(channelId)
      .populate('members')
      .exec();
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Fetch online members from the channel's members list
    const onlineMembers = await this.userModel.find({
      _id: { $in: channel.members },
      isOnline: true, // Check the online status
    });

    return onlineMembers;
  }

  async findAllChannels(): Promise<Channel[]> {
    try {
      return this.channelModel.find().populate('members').exec();
    } catch (error) {
      throw new Error('Error fetching channels');
    }
  }
}
