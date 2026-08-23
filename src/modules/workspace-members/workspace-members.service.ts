import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import AddWorkspaceMembersDto from './dto/add-workspace-members.dto';
import {
  OrganizationMemberRole,
  WorkspaceMemberRole,
} from 'generated/prisma/enums';

@Injectable()
export class WorkspaceMembersService {
  constructor(private readonly prismaService: PrismaService) {}

  async addWorkspaceMembers(
    workspaceId: string,
    data: AddWorkspaceMembersDto,
    req: Request,
  ) {
    const userId: string = req.user.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required.');
    }

    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        organization: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found.');
    }

    if (!workspace.isActive) {
      throw new BadRequestException(
        'Cannot add members to an inactive workspace.',
      );
    }

    if (!workspace.organization.isActive) {
      throw new BadRequestException(
        'Cannot add members to an inactive organization.',
      );
    }

    const requesterMembership =
      await this.prismaService.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: workspace.organizationId,
          },
        },
        select: {
          role: true,
          id: true,
          isActive: true,
        },
      });

    if (!requesterMembership || !requesterMembership.isActive) {
      throw new ForbiddenException(
        'You are not an active member of this organization.',
      );
    }

    const allowedRoles: OrganizationMemberRole[] = [
      OrganizationMemberRole.OWNER,
      OrganizationMemberRole.ADMIN,
    ];

    if (!allowedRoles.includes(requesterMembership.role)) {
      throw new ForbiddenException(
        'You do not have permission to add workspace members.',
      );
    }

    const requestedMemberIds = [...new Set(data.members)];

    const existingMembers = await this.prismaService.workspaceMember.findMany({
      where: {
        workspaceId,
        userId: {
          in: requestedMemberIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const existingMemberIds = new Set(
      existingMembers.map((member) => member.userId),
    );

    const memberIdsToAdd = requestedMemberIds.filter(
      (memberId) => !existingMemberIds.has(memberId),
    );

    if (!memberIdsToAdd.length) {
      throw new BadRequestException(
        'All selected users are already members of this workspace.',
      );
    }

    const organizationMembers =
      await this.prismaService.organizationMember.findMany({
        where: {
          organizationId: workspace.organizationId,
          userId: {
            in: memberIdsToAdd,
          },
          isActive: true,
        },
        select: {
          userId: true,
        },
      });

    const validMemberIds = organizationMembers.map((member) => member.userId);

    const validMemberSet = new Set(validMemberIds);

    const invalidMemberIds = memberIdsToAdd.filter(
      (memberId) => !validMemberSet.has(memberId),
    );

    if (invalidMemberIds.length) {
      throw new BadRequestException(
        'One or more users are not active members of this organization.',
      );
    }

    await this.prismaService.workspaceMember.createMany({
      data: validMemberIds.map((memberId) => ({
        workspaceId,
        userId: memberId,
        role: WorkspaceMemberRole.MEMBER,
      })),
      skipDuplicates: true,
    });

    return {
      success: true,
      message: 'Workspace members added successfully.',
      addedCount: validMemberIds.length,
    };
  }

  async getWorkspaceMembers(workspaceId: string, req: Request) {
    const userId: string = req.user.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required.');
    }

    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        organization: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found.');
    }

    const requesterMembership =
      await this.prismaService.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: workspace.organizationId,
          },
        },
        select: {
          role: true,
          id: true,
          isActive: true,
        },
      });

    if (!requesterMembership || !requesterMembership.isActive) {
      throw new ForbiddenException(
        'You are not an active member of this organization.',
      );
    }

    const isOrgOwnerOrAdmin =
      requesterMembership.role === OrganizationMemberRole.OWNER ||
      requesterMembership.role === OrganizationMemberRole.ADMIN;

    const workspaceMember = await this.prismaService.workspaceMember.findUnique(
      {
        where: {
          workspaceId_userId: {
            userId,
            workspaceId,
          },
        },
        select: {
          role: true,
          id: true,
        },
      },
    );

    if (!workspaceMember && !isOrgOwnerOrAdmin) {
      throw new ForbiddenException(
        'You are not an active member of this workspace.',
      );
    }

    const members = await this.prismaService.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Workspace members fetched successfully.',
      members,
    };
  }
}
