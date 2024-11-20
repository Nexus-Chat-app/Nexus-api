import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { UserController } from '../../api/user.controller';
import { UserGateway } from '../../gateway/user/user.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService, UserGateway],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
