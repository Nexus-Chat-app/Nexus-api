import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  _id: string; 
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Access Denied. No token provided.');
    }

    try {
      // Verify the token using JWT_SECRET
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as JwtPayload;

      // Attach the user's _id to req.user
      req.user = { _id: decoded._id };
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
