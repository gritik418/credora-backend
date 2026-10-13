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
import {
  OrganizationMemberRole,
  WorkspaceMemberRole,
  WorkspaceStatus,
} from 'generated/prisma/enums';
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
        status: WorkspaceStatus.ACTIVE,
        createdById: userId,
        createdAt: new Date(),
        members: {
          create: {
            userId,
            role: WorkspaceMemberRole.ADMIN,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Workspace created successfully.',
      data: {
        workspace,
      },
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
      data: {
        workspaces,
      },
    };
  }

  async getWorkspaceBySlug(
    organizationId: string,
    workspaceSlug: string,
    req: Request,
  ) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        slug: workspaceSlug,
        organizationId,
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found.');

    const organizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        select: {
          id: true,
          isActive: true,
          role: true,
        },
      });

    if (!organizationMember)
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );
    if (!organizationMember.isActive)
      throw new ForbiddenException(
        'You are not an active member of this organization.',
      );

    const workspaceMember = await this.prismaService.workspaceMember.findUnique(
      {
        where: {
          workspaceId_userId: {
            workspaceId: workspace.id,
            userId,
          },
        },
        select: {
          id: true,
          role: true,
        },
      },
    );

    const isOrgAdminOrOwner =
      organizationMember.role === OrganizationMemberRole.OWNER ||
      organizationMember.role === OrganizationMemberRole.ADMIN;

    if (!workspaceMember && !isOrgAdminOrOwner)
      throw new ForbiddenException('You are not a member of this workspace.');

    return {
      success: true,
      message: 'Workspace fetched successfully.',
      data: {
        workspace,
      },
    };
  }

  async switchWorkspace(
    workspaceId: string,
    organizationId: string,
    req: Request,
  ) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const workspaceMember = await this.prismaService.workspaceMember.findUnique(
      {
        where: {
          workspaceId_userId: {
            userId,
            workspaceId,
          },
        },
      },
    );

    const organizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });

    if (!organizationMember)
      throw new ForbiddenException(
        'You are not authorized to switch to this workspace.',
      );

    const isOrgAdminOrOwner =
      organizationMember.role === OrganizationMemberRole.OWNER ||
      organizationMember.role === OrganizationMemberRole.ADMIN;

    if (!workspaceMember && !isOrgAdminOrOwner)
      throw new ForbiddenException(
        'You are not authorized to switch to this workspace.',
      );

    if (!organizationMember.isActive)
      throw new ForbiddenException(
        'Your account is inactive. Please contact the organization admin to activate your account.',
      );

    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found.');

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        selectedWorkspaceId: workspace.id,
      },
    });

    return {
      success: true,
      message: 'Workspace switched successfully.',
      data: {
        workspace,
      },
    };
  }
}
