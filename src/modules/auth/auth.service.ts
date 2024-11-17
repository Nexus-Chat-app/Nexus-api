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
  
  
  async loginUser(credentials: {
    identifier: string;
    password: string;
  }): Promise<AxiosResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/login`, credentials),
      );
      return response;
    } catch (error) {
      throw new HttpException(
        `Error logging in user: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
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
  
}
