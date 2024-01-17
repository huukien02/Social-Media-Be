// auth.middleware.ts

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: any, res: Response, next: NextFunction) {
    try {
      const accessToken = req.headers['token'];
      if (!accessToken) {
        throw new UnauthorizedException('Access token is missing');
      }

      const user = await this.authService.verifyAccessToken(accessToken);
      req['user'] = user;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
