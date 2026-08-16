import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names.constant';
import { JwtPayload } from 'src/modules/auth/types/jwt-payload.type';

declare module 'express' {
  export interface Request {
    user: JwtPayload;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      const token = request.cookies[AUTH_COOKIE_NAME];

      if (!token) {
        throw new UnauthorizedException('Unauthorized.');
      }

      const payload: JwtPayload = this.jwtService.verify(token);

      if (!payload) throw new UnauthorizedException('Unauthorized.');

      if (!payload.id || !payload.email || !payload.role)
        throw new UnauthorizedException('Unauthorized.');

      request.user = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }
}
