import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import CreateOrganizationDto from './dto/create-organization.dto';
import { PrismaService } from 'src/database/prisma.service';
import { HashingService } from 'src/common/hashing/hashing.service';
import { v4 as uuidv4 } from 'uuid';
import { EmailProducer } from 'src/queue/producers/email.producer';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { OrganizationMemberRole } from 'generated/prisma/enums';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly emailProducer: EmailProducer,
    private readonly configService: ConfigService,
  ) {}

  async createOrganization(data: CreateOrganizationDto, req: Request) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UnauthorizedException('Unauthorized.');

    if (!user.isEmailVerified)
      throw new UnauthorizedException(
        'Please verify your email before creating an organization.',
      );

    if (!user.isActive)
      throw new UnauthorizedException(
        'Your account is inactive. Please contact the admin to activate your account.',
      );

    const existingEmail = await this.prismaService.organization.findFirst({
      where: {
        email: data.email,
      },
    });

    if (existingEmail) {
      if (existingEmail.isEmailVerified) {
        throw new ConflictException(
          'An organization with this email already exists.',
        );
      }
    }

    const existingSlug = await this.prismaService.organization.findFirst({
      where: {
        slug: data.slug,
      },
    });

    if (existingSlug) {
      if (existingSlug.isEmailVerified)
        throw new ConflictException(
          'An organization with this slug already exists.',
        );
    }

    const verificationTokenExpiry: Date = new Date(Date.now() + 10 * 60 * 1000);
    const verificationToken: string = uuidv4();
    const hashedVerificationToken: string = await this.hashingService.hashValue(
      verificationToken,
      8,
    );

    const organization =
      existingEmail || existingSlug
        ? await this.prismaService.organization.update({
            where: {
              id: (existingEmail || existingSlug)!.id,
            },
            data: {
              slug: data.slug,
              name: data.name,
              description: data.description,
              website: data.website,
              logo: data.logo,
              email: data.email,

              isEmailVerified: false,
              isActive: false,

              emailVerificationToken: hashedVerificationToken,
              emailVerificationTokenExpiry: verificationTokenExpiry,
            },
          })
        : await this.prismaService.organization.create({
            data: {
              slug: data.slug,
              email: data.email,
              name: data.name,
              description: data.description,
              website: data.website,
              logo: data.logo,

              emailVerificationToken: hashedVerificationToken,
              emailVerificationTokenExpiry: verificationTokenExpiry,

              isEmailVerified: false,
              isActive: false,
            },
          });

    const existingMember =
      await this.prismaService.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

    existingMember
      ? await this.prismaService.organizationMember.update({
          where: {
            id: existingMember.id,
          },
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: OrganizationMemberRole.OWNER,
            isActive: true,
          },
        })
      : await this.prismaService.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: OrganizationMemberRole.OWNER,
            isActive: true,
            joinedAt: new Date(),
          },
        });

    const verificationLink: string = `${this.configService.get('CLIENT_URL')}/organization/verify-email?token=${verificationToken}&oid=${organization.id}`;

    await this.emailProducer.sendOrganizationVerificationEmail({
      name: organization.name,
      email: organization.email,
      slug: organization.slug,
      description: organization.description || '',
      website: organization.website || '',
      logo: organization.logo || '',
      verificationLink,
    });

    return {
      success: true,
      message: 'Organization created successfully.',
      organizationId: organization.id,
    };
  }
}
