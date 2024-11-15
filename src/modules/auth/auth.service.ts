/* 
    Business logic for authentication
*/

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService { 
    constructor(private readonly httpService: HttpService) {}

    async registerUser(userData: any): Promise<AxiosResponse> {
        const authServiceUrl = `process.env.AUTH_SERVICE_URL/register`;

        try { 
            const response = await this.httpService.post(authServiceUrl, userData).toPromise();
            return response;
        } catch ( error ) {
            throw new Error('Error registering user: ${error.message}');
        }
    }

    async loginUser(userData: any): Promise<AxiosResponse> {
        const authServiceUrl = `process.env.AUTH_SERVICE_URL/login`;

        try { 
            const response = await this.httpService.post(authServiceUrl, userData).toPromise();
            return response;
        } catch ( error ) {
            throw new Error('Error logging in user: ${error.message}');
        }
    }
}