import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import RegisterDto from './dto/register.dto';
import { AuthProvider, UserRole } from 'generated/prisma/enums';
import { HashingService } from 'src/common/hashing/hashing.service';
import { v4 as uuidv4 } from 'uuid';
import LoginDto from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.type';
import { Response } from 'express';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names.constant';
import cookieOptions from 'src/common/constants/cookie-options.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  private getProviderName(provider: AuthProvider) {
    return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
  }

  // TODO: Send email verification mail, update isEmailVerified to false by default
  async register(data: RegisterDto) {
    if (data.role === UserRole.ADMIN) {
      throw new BadRequestException(
        'Admin registration is not allowed. Please contact the administrator to create an admin account.',
      );
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
      include: {
        accounts: true,
      },
    });

    if (existingUser) {
      const credentialsAccount = existingUser?.accounts.find(
        (a) => a.provider === AuthProvider.CREDENTIALS,
      );

      const oauthAccount = existingUser?.accounts.find(
        (a) => a.provider !== AuthProvider.CREDENTIALS,
      );

      if (existingUser?.isEmailVerified) {
        if (credentialsAccount) {
          throw new BadRequestException('Email already exists.');
        }

        if (oauthAccount) {
          throw new BadRequestException(
            `Account already exists. Please sign in with ${this.getProviderName(oauthAccount.provider)}.`,
          );
        }
      }

      if (!existingUser.isEmailVerified) {
        const expired =
          !existingUser.emailVerificationToken ||
          !existingUser.emailVerificationTokenExpiry ||
          existingUser.emailVerificationTokenExpiry < new Date();

        if (!expired) {
          throw new BadRequestException('Please verify your email first.');
        }

        await this.prismaService.user.delete({
          where: {
            email: data.email,
          },
        });
      }
    }

    const hashedPassword: string = await this.hashingService.hashValue(
      data.password,
    );

    const emailVerificationToken: string = uuidv4();

    await this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
        role: data.role,
        isEmailVerified: true,

        accounts: {
          create: {
            provider: AuthProvider.CREDENTIALS,
            providerAccountId: data.email,
          },
        },
      },
    });

    return {
      success: true,
      message: `Verification link has been sent to your email address. Please verify your email address within 10 minutes.`,
    };
  }

  async login(data: LoginDto, res: Response) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
      include: {
        accounts: true,
      },
    });

    if (!user || !user.isEmailVerified) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const credentialsProvider = user.accounts.find(
      (a) => a.provider === AuthProvider.CREDENTIALS,
    );
    const oauthAccount = user.accounts.find(
      (a) => a.provider !== AuthProvider.CREDENTIALS,
    );

    if (!credentialsProvider || !user.password) {
      if (oauthAccount) {
        throw new BadRequestException(
          `Please sign in with ${this.getProviderName(oauthAccount.provider)}.`,
        );
      }

      throw new UnauthorizedException('Invalid credentials.');
    }

    const validPassword = await this.hashingService.compareValues(
      data.password,
      user.password,
    );

    if (!validPassword) throw new UnauthorizedException('Invalid credentials.');

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token: string = this.jwtService.sign(payload);

    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);

    return {
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        avatar: user.avatar || '',
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
