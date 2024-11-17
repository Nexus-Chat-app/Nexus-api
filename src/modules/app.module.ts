import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import { UserModule } from './user/user.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { RabbitMQEvents } from 'src/events/rabbitmq.events';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseConfig,
    UserModule,
    ChannelModule,
    ChatModule,
    
  ],
  providers: [RabbitMQEvents],
})

export class AppModule {}