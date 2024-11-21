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
    @Body()
    credentials: {
      identifier: string;
      password: string;
      rememberMe: boolean;
    },
  ) {
    try {
      const result = await this.authService.loginUser(credentials);
      return result;
    } catch (error) {
      return { message: 'Error logging in user', error: error.message };
    }
  }

  //Login OTP
  @Post('verify-otp')
  async verifyOtp(
    @Body()
    otpData: {
      identifier: string;
      otp: string;
      rememberDevice: boolean;
    },
  ) {
    try {
      // Pass the OTP verification request to the service
      const response = await this.authService.verifyOtp(otpData);
      return response;
    } catch (error) {
      console.error('OTP verification failed:', error.message);
      return { message: 'OTP verification failed', error: error.message };
    }
  }

  //Request Reset Link
  @Post('forgot-password')
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  //Reset Password
  @Post('reset-password')
  async resetPassword(
    @Body()
    body: {
      token: string;
      newPassword: string;
      confirmNewPassword: string;
    },
  ) {
    return this.authService.resetPassword(body);
  }
}
