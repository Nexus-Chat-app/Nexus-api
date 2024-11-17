import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';
import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { inspect } from 'util';

@Injectable()
export class AuthService {
  private authServiceUrl = process.env.AUTH_SERVICE_URL;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(User.name) private readonly userModel: Model<User>, // Corrected injection
  ) {}

  async registerUser(userData: {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    roles: [string];
  }): Promise<any> {
    let authServiceUser = null; 
    let chatDbUser = null;
  
    try {
      // Register user in Auth Service
      console.log('Sending user data for registration to Auth Service');
      const authResponse = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/register`, userData),
      );
      console.log('Auth Service Response:', authResponse.data);
      authServiceUser = authResponse.data.user;
  
      // Sync user to Chat DB
      chatDbUser = await this.syncUserToChatDb(authServiceUser);
  
      return {
        message: 'User registered successfully in both services.',
        authServiceUser,
        chatDbUser,
      };
    } catch (error) {
      console.error('Transaction Error:', error.message);
  
      if (authServiceUser) {
        try {
          await firstValueFrom(
            this.httpService.delete(`${this.authServiceUrl}/delete/${authServiceUser.id}`),
          );
          console.log('Rolled back Auth Service registration.');
        } catch (rollbackError) {
          console.error('Failed to rollback Auth Service registration:', rollbackError.message);
        }
      }
  
      if (chatDbUser) {
        try {
          await this.userModel.deleteOne({ _id: chatDbUser._id }).exec();
          console.log('Rolled back Chat DB sync.');
        } catch (rollbackError) {
          console.error('Failed to rollback Chat DB sync:', rollbackError.message);
        }
      }
  
      // Throw an exception to inform the client
      throw new HttpException(
        `Transaction failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  
  async loginUser(loginData: { identifier: string; password: string; rememberMe: boolean }) {
    try {
      // Send login request to the Auth service
      console.log('Sending login request to Auth Service');
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.AUTH_SERVICE_URL}/login`, loginData)
      );

      if (response.status === 200) {
        // If device is trusted, return success response with user data and tokens
        return response.data;
      } else {
        // If device is not trusted, return message indicating OTP has been sent
        return {
          message: 'OTP sent to your email. Please verify to complete login.',
          user: response.data.user,  // Include user data to show username/email
        };
      }
    } catch (error) {
      console.error('Error during login request:', error.message);
      throw new Error('Authentication failed');
    }
  }

  // Method to verify OTP (sends OTP data to auth service)
  async verifyOtp(otpData: { identifier: string; otp: string, rememberDevice: boolean }) {
    try {
      // Send OTP verification request to the Auth service
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.AUTH_SERVICE_URL}/verify-otp`, otpData)
      );

      if (response.status === 200) {
        // If OTP is valid, return the success message and user info
        return {
          message: 'OTP verified successfully. Login successful.',
          user: response.data.user,  
          accessToken: response.data.accessToken,
        };
      } else {
        // If OTP verification fails
        return { message: 'OTP verification failed', error: response.data.error };
      }
    } catch (error) {
      console.error('Error during OTP verification:', error.message);
      throw new Error('OTP verification failed');
    }
  }

  // Verify the JWT token
  async authenticate(token: string): Promise<any> {
    const tokenValidationUrl = `${process.env.AUTH_SERVICE_URL}/verify/check-token`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenValidationUrl, { token }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error authenticating user: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Sync the user data to the chat service
  private async syncUserToChatDb(user: any) {
    const hashedPassword = user.password
      ? await bcrypt.hash(user.password, 10)
      : 'hashed-placeholder';
  
    const mappedUser = {
      username: user.username,
      email: user.email,
      phone: user.phoneNumber,
      password: hashedPassword,
      roles: user.roles.map(role => String(role)), // Ensure roles are strings
    };
  
  
    try {
      const newUser = new this.userModel(mappedUser);
      await newUser.validate(); // Validate before saving
      const result = await newUser.save();
      console.log('User synced to Chat Service database:', result);
      return result;
    } catch (error) {
      console.error('Error syncing user to Chat DB:', error.message, error.stack);
      throw new Error(`Error syncing user to Chat DB: ${error.message}`);
    }
  }

  // Get User Online
  async setUserOnlineStatus(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      if ( !user ) {
        throw new Error('User not found');
      }
      user.isOnline = true;
      await user.save();
    } catch (err) {
      throw new HttpException(
        `Error getting user online status: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}