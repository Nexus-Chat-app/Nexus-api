/* 
    MongoDB model for user authentication 
*/

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from 'src/api/auth.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

@Module({
    imports: [HttpModule, UserModule],
    providers: [AuthService , UserService],
    controllers:[AuthController],
    exports: [AuthService , UserService]
})
export class AuthModule {}
