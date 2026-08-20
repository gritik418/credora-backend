import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import RegisterOrganizationDto from './dto/register-organization.dto';
import { PrismaService } from 'src/database/prisma.service';
import { HashingService } from 'src/common/hashing/hashing.service';
import OrganizationLoginDto from './dto/organization-login.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { OrgJwtPayload } from './types/org-jwt-payload.type';
import { ORG_AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names.constant';
import cookieOptions from 'src/common/constants/cookie-options.constant';
import { EmailProducer } from 'src/queue/producers/email.producer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrganizationAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly emailProducer: EmailProducer,
    private readonly configService: ConfigService,
  ) {}

  async registerOrganization(data: RegisterOrganizationDto) {
    const existingEmail = await this.prismaService.organization.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingEmail?.isEmailVerified) {
      throw new ConflictException(
        'An organization with this email already exists.',
      );
    }

    const existingSlug = await this.prismaService.organization.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingSlug?.isEmailVerified) {
      throw new ConflictException(
        'This organization slug is already taken. Please choose another one.',
      );
    }

    const hashedPassword = await this.hashingService.hashValue(data.password);

    const verificationToken = uuidv4();

    const hashedVerificationToken = await this.hashingService.hashValue(
      verificationToken,
      8,
    );

    const verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const organization =
      existingEmail || existingSlug
        ? await this.prismaService.organization.update({
            where: {
              id: (existingEmail ?? existingSlug)!.id,
            },
            data: {
              name: data.name,
              email: data.email,
              slug: data.slug,
              description: data.description,
              logo: data.logo,
              website: data.website,
              password: hashedPassword,

              emailVerificationToken: hashedVerificationToken,
              emailVerificationTokenExpiry: verificationTokenExpiry,

              isEmailVerified: false,
              isActive: false,
            },
          })
        : await this.prismaService.organization.create({
            data: {
              name: data.name,
              email: data.email,
              slug: data.slug,
              description: data.description,
              logo: data.logo,
              website: data.website,
              password: hashedPassword,

              emailVerificationToken: hashedVerificationToken,
              emailVerificationTokenExpiry: verificationTokenExpiry,

              isEmailVerified: false,
              isActive: false,
            },
          });

    const verificationLink: string =
      this.configService.get<string>('CLIENT_URL') +
      `/organization/auth/verify-email?oid=${organization.id}&token=${verificationToken}`;

    await this.emailProducer.sendOrganizationVerificationEmail({
      name: organization.name,
      description: organization.description || '',
      email: organization.email,
      logo: organization.logo || '',
      website: organization.website || '',
      slug: organization.slug,
      verificationLink,
    });

    return {
      success: true,
      message:
        'Organization registered successfully. Please check your email and verify your account to continue.',
      organizationId: organization.id,
    };
  }

  async organizationLogin(data: OrganizationLoginDto, res: Response) {
    const organization = await this.prismaService.organization.findUnique({
      where: {
        email: data.email,
      },
    });

    if (
      !organization ||
      !organization.isActive ||
      !organization.isEmailVerified
    ) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordMatched = await this.hashingService.compareValues(
      data.password,
      organization.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    await this.prismaService.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    const payload: OrgJwtPayload = {
      email: organization.email,
      id: organization.id,
    };

    const token: string = this.jwtService.sign(payload);

    res.cookie(ORG_AUTH_COOKIE_NAME, token, cookieOptions);

    return {
      success: true,
      message: 'Login successful.',
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        slug: organization.slug,
        logo: organization.logo,
        website: organization.website,
        description: organization.description,
      },
    };
  }
}
