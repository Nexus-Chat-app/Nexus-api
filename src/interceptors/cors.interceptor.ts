import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse();
    response.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return next.handle();
  }
}