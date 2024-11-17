/* 
    Authentication endpoints
*/

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../modules/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Register a new user
  @Post('register')
  async registerUser(
    @Body()
    userData: {
      username: string;
      email: string;
      phoneNumber: string;
      password: string;
      roles: [string];
    },
  ) {
    userData.roles = ['User'];
    try {
      const result = await this.authService.registerUser(userData);
      return result;
    } catch (error) {
      return { message: 'Error registering user', error: error.message };
    }
  }

  //Login a user
  @Post('login')
  async loginUser(
    @Body() credentials: { identifier: string; password: string },
  ) {
    try {
      const result = await this.authService.loginUser(credentials);
      return { message: 'User logged in successfully', user: result };
    } catch (error) {
      return { message: 'Error logging in user', error: error.message };
    }
  }
}
