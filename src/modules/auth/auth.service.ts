import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import RegisterDto from './dto/register.dto';
import { AuthProvider, UserRole } from 'generated/prisma/enums';
import { HashingService } from 'src/common/hashing/hashing.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
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
}
