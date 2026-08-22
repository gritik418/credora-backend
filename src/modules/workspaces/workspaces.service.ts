import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import CreateWorkspaceDto from './dto/create-workspace.dto';
import { OrganizationMemberRole } from 'generated/prisma/enums';
import { Workspace } from 'generated/prisma/browser';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createWorkspace(
    organizationId: string,
    data: CreateWorkspaceDto,
    req: Request,
  ) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const organization = await this.prismaService.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        organizationMembers: {
          where: {
            userId,
          },
        },
      },
    });

    if (!organization) throw new NotFoundException('Organization not found.');

    if (!organization.organizationMembers.length)
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );

    const member = organization.organizationMembers[0];

    if (
      member.role !== OrganizationMemberRole.OWNER &&
      member.role !== OrganizationMemberRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You are not authorized to create a workspace in this organization.',
      );
    }

    const existingWorkspace = await this.prismaService.workspace.findFirst({
      where: {
        organizationId,
        slug: data.slug,
      },
    });

    if (existingWorkspace)
      throw new BadRequestException('Workspace slug already exists.');

    const workspace = await this.prismaService.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        logo: data.logo,
        organizationId,
        isActive: true,
        createdById: userId,
        createdAt: new Date(),
        members: {
          create: {
            userId,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Workspace created successfully.',
      workspace,
    };
  }

  async getWorkspaces(organizationId: string, req: Request) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const organization = await this.prismaService.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        organizationMembers: {
          where: {
            userId,
          },
        },
      },
    });

    if (!organization) throw new NotFoundException('Organization not found.');

    if (!organization.organizationMembers.length)
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );

    const member = organization.organizationMembers[0];

    const isOwnerOrAdmin =
      member.role === OrganizationMemberRole.OWNER ||
      member.role === OrganizationMemberRole.ADMIN;

    let workspaces: Workspace[] = [];

    if (isOwnerOrAdmin) {
      workspaces = await this.prismaService.workspace.findMany({
        where: {
          organizationId,
        },
      });
    } else {
      workspaces = await this.prismaService.workspace.findMany({
        where: {
          organizationId,
          members: {
            some: {
              userId,
            },
          },
        },
      });
    }

    return {
      success: true,
      message: 'Workspaces fetched successfully.',
      workspaces,
    };
  }
}
