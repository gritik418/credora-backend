import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { OrganizationMember } from 'generated/prisma/browser';
import { OrganizationMemberRole } from 'generated/prisma/enums';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class OrganizationMembersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMembers(organizationId: string, req: Request) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) throw new NotFoundException('Organization not found.');

    const member = await this.prismaService.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (!member)
      throw new BadRequestException(
        'You are not a member of this organization.',
      );

    const members = await this.prismaService.organizationMember.findMany({
      where: {
        organizationId,
      },
    });

    return {
      success: true,
      message: 'Members fetched successfully.',
      members,
    };
  }
}
