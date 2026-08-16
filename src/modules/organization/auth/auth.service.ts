import { ConflictException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import RegisterOrganizationDto from './dto/register-organization.dto';
import { PrismaService } from 'src/database/prisma.service';
import { HashingService } from 'src/common/hashing/hashing.service';

@Injectable()
export class OrganizationAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  // TODO: send email verification mail
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

              isEmailVerified: true, // TODO: change, only true after email verification
              isActive: true, // TODO: change, only active after email verification
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

              isEmailVerified: true, // TODO: change, only true after email verification
              isActive: true, // TODO: change, only active after email verification
            },
          });

    return {
      success: true,
      message:
        'Organization registered successfully. Please check your email and verify your account to continue.',
      organizationId: organization.id,
    };
  }
}
