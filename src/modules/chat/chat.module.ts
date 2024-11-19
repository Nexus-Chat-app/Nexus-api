/* 
    MongoDB operations for chat data 
*/

import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatSchema } from './chat.schema';
import { ChatController } from 'src/api/chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
  UserModule,
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '1h' },
})],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService], 
})
export class ChatModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: 'chat/*', method: RequestMethod.ALL });
  }
}
