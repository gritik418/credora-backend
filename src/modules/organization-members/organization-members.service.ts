import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class OrganizationMembersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMembers(organizationId: string, req: Request) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
      include: {
        organizationMembers: {
          where: { userId },
        },
      },
    });

    if (!organization) throw new NotFoundException('Organization not found.');

    if (!organization.organizationMembers.length)
      throw new BadRequestException(
        'You are not a member of this organization.',
      );

    const members = await this.prismaService.organizationMember.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            isActive: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Members fetched successfully.',
      data: {
        members,
      },
    };
  }
}
