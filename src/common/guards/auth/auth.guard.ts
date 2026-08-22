import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names.constant';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayload } from 'src/modules/auth/types/jwt-payload.type';

declare module 'express' {
  export interface Request {
    user: JwtPayload;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const payload: JwtPayload = this.jwtService.verify(token);

    if (!payload) throw new UnauthorizedException('Unauthorized.');

    if (!payload.id || !payload.email || !payload.role)
      throw new UnauthorizedException('Unauthorized.');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        isEmailVerified: true,
        isActive: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials.');

    if (!user?.isEmailVerified)
      throw new UnauthorizedException(
        'Your email is not verified. Please verify your email to continue.',
      );

    if (!user?.isActive)
      throw new UnauthorizedException(
        'Your account is not active. Please contact the administrator.',
      );

    request.user = payload;

    return true;
  }
}
