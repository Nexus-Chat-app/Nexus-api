/* 
    This file is responsible for handling all the business logic of the channel module.
    It contains all the methods that are required to perform CRUD operations on the channels.
*/
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel } from './channel.schema';

@Injectable()
export class ChannelService {
  constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>) {}

  async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    const channel = new this.channelModel(channelData);
    return channel.save();
  }
}
