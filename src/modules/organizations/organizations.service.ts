import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { OrganizationMemberRole } from 'generated/prisma/enums';
import { PrismaService } from 'src/database/prisma.service';
import CreateOrganizationDto from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prismaService: PrismaService) {}

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
      data: {
        organizationId: organization.id,
      },
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
      data: {
        organizations,
      },
    };
  }

  async getOrganizationBySlug(slug: string, req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const organization = await this.prismaService.organization.findUnique({
      where: {
        slug,
      },
    });

    if (!organization) throw new NotFoundException('Organization not found.');

    const membership = await this.prismaService.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          organizationId: organization.id,
          userId,
        },
      },
    });

    if (!membership) throw new ForbiddenException('Access denied.');

    return {
      success: true,
      message: 'Organization fetched successfully.',
      data: {
        organization,
      },
    };
  }
}
