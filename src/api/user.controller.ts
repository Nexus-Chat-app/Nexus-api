import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UserService } from '../modules/user/user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // Endpoint to set a user's online status
  @Get('set-user-online/:id/:isOnline')
  async setUserOnline(
    @Param('id') userId: string,
    @Param('isOnline') isOnline: boolean,
  ) {
    return this.userService.setUserOnline(userId, isOnline);
  }

  // Endpoint to get online friends of a user
  @Get('online-friends/:id')
  async getOnlineFriends(@Param('id') userId: string) {
    return this.userService.getOnlineFriends(userId);
  }
}

