
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelService } from './channel.service';
import { ChannelSchema } from './channel.schema';
import { ChannelController } from 'src/api/channels.controller';


@Module({
  imports: [MongooseModule.forFeature([{ name: 'Channel', schema: ChannelSchema }])],
  providers: [ChannelService],
  exports: [ChannelService], 
  controllers: [ChannelController]
})
export class ChannelModule {}
