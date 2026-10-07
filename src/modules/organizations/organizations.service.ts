import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { OrganizationMemberRole } from 'generated/prisma/enums';
import { HashingService } from 'src/common/hashing/hashing.service';
import { PrismaService } from 'src/database/prisma.service';
import { EmailProducer } from 'src/queue/producers/email.producer';
import CreateOrganizationDto from './dto/create-organization.dto';

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

    const existingSlug = await this.prismaService.organization.findFirst({
      where: {
        slug: data.slug,
      },
    });

    if (existingSlug) {
      throw new ConflictException(
        'An organization with this slug already exists.',
      );
    }

    const organization = await this.prismaService.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          slug: data.slug,
          supportEmail: data.supportEmail,
          name: data.name,
          description: data.description,
          website: data.website,
          logo: data.logo,

          isActive: true,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: OrganizationMemberRole.OWNER,
          isActive: true,
          joinedAt: new Date(),
        },
      });

      return organization;
    });

    return {
      success: true,
      message: 'Organization created successfully.',
      organizationId: organization.id,
    };
  }

  async getOrganizations(req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const memberships = await this.prismaService.organizationMember.findMany({
      where: {
        userId,
      },
      include: {
        organization: true,
      },
    });

    const organizations = memberships.map((membership) => ({
      ...membership.organization,
      role: membership.role,
      membershipId: membership.id,
      joinedAt: membership.joinedAt,
      isActive: membership.isActive,
    }));

    return {
      success: true,
      message: 'Organizations fetched successfully.',
      organizations,
    };
  }
}
