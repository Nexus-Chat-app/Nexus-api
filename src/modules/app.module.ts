import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import { UserModule } from './user/user.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { NotificationModule } from './notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorsInterceptor } from '../interceptors/cors.interceptor'; 


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseConfig,
    UserModule,
    ChannelModule,
    ChatModule,
    FriendModule,
    NotificationModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorsInterceptor,
    }
  ]
})

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('chat')
  }
}