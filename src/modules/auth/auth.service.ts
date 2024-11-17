/* 
    Business logic for authentication
*/

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private authServiceUrl = 'http://localhost:3000';
  constructor(private readonly httpService: HttpService) {}

  async registerUser(userData: {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<AxiosResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/register`, userData),
      );
      return response;
    } catch (error) {
      throw new Error('Error registering user: ${error.message}');
    }
  }

  async loginUser(credentials: { identifier: string; password: string }): Promise<AxiosResponse> {
    const authServiceUrl = `process.env.AUTH_SERVICE_URL/login`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/login`, credentials),
      );
      return response;
    } catch (error) {
      throw new Error('Error logging in user: ${error.message}');
    }
  }

  // Verify the JWT token
  async authenticate(token: string): Promise<any> {
    const tokenValidationUrl = `process.env.AUTH_SERVICE_URL/verify/check-token`;

    try {
      const response = await this.httpService
        .post(tokenValidationUrl, { token })
        .toPromise();
      return response.data;
    } catch (error) {
      throw new Error('Error authenticating user: ${error.message}');
    }
  }
}
