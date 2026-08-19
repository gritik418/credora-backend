import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
import { Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names.constant';
import cookieOptions from 'src/common/constants/cookie-options.constant';
import { User } from 'generated/prisma/client';
import { EmailProducer } from 'src/queue/producers/email.producer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly emailProducer: EmailProducer,
    private readonly configService: ConfigService,
  ) {}

  private getProviderName(provider: AuthProvider) {
    return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
  }

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
    }

    const hashedPassword: string = await this.hashingService.hashValue(
      data.password,
    );

    const emailVerificationToken: string = uuidv4();

    const hashedEmailVerificationToken: string =
      await this.hashingService.hashValue(emailVerificationToken, 8);

    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user: User | null = null;

    if (existingUser) {
      const credentialsAccount = existingUser.accounts.find(
        (account) => account.provider === AuthProvider.CREDENTIALS,
      );

      user = await this.prismaService.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: data.name,
          role: data.role,
          password: hashedPassword,

          isEmailVerified: false,
          isActive: false,

          emailVerificationToken: hashedEmailVerificationToken,
          emailVerificationTokenExpiry: verificationTokenExpiry,

          ...(credentialsAccount
            ? {}
            : {
                accounts: {
                  create: {
                    provider: AuthProvider.CREDENTIALS,
                    providerAccountId: data.email,
                  },
                },
              }),
        },
      });
    } else {
      user = await this.prismaService.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,

          isEmailVerified: false,
          isActive: false,

          emailVerificationToken: hashedEmailVerificationToken,
          emailVerificationTokenExpiry: verificationTokenExpiry,

          accounts: {
            create: {
              provider: AuthProvider.CREDENTIALS,
              providerAccountId: data.email,
            },
          },
        },
      });
    }

    const verificationLink = `${this.configService.get<string>('CLIENT_URL')}/auth/verify-email?token=${emailVerificationToken}`;

    await this.emailProducer.sendUserVerificationEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      verificationLink,
    });

    return {
      success: true,
      message: `Verification link has been sent to your email address. Please verify your email address within 10 minutes.`,
      userId: user.id,
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

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

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

  async getMe(req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
        isEmailVerified: true,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        role: true,
        lastLoginAt: true,
        isActive: true,
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated.');
    }

    const { isActive, ...userInfo } = user;

    return {
      success: true,
      message: 'User fetched successfully.',
      user: userInfo,
    };
  }
}
