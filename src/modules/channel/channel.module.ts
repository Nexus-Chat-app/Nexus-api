/* 
    This file contains the MongoDB Model for the Channels Module
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelService } from './channel.service';
import { ChannelSchema } from './channel.schema';
import { UserModule } from '../user/user.module';
import { ChannelController } from '../../api/channels.controller';
import { ChannelGateway } from '../../gateway/channel/channel.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Channel', schema: ChannelSchema }]),
    UserModule,
  ],
  providers: [ChannelService, ChannelGateway],
  exports: [ChannelService],
  controllers: [ChannelController],
})
export class ChannelModule {}
