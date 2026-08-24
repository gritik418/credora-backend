import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import AddProjectMembersDto from './dto/add-project-members.dto';
import {
  OrganizationMemberRole,
  ProjectMemberRole,
  WorkspaceMemberRole,
} from 'generated/prisma/enums';

@Injectable()
export class ProjectMembersService {
  constructor(private readonly prismaService: PrismaService) {}

  async addMembers(
    projectId: string,
    data: AddProjectMembersDto,
    req: Request,
  ) {
    const userId: string = req.user.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    if (!projectId) {
      throw new BadRequestException('Project ID is required.');
    }

    const project = await this.prismaService.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          select: { id: true, isActive: true },
        },
        organization: {
          select: { id: true, isActive: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (!project.workspace) {
      throw new NotFoundException('Workspace not found.');
    }

    if (!project.workspace.isActive) {
      throw new BadRequestException(
        'Cannot add members to an inactive workspace.',
      );
    }

    if (!project.organization.isActive) {
      throw new BadRequestException(
        'Cannot add members to an inactive organization.',
      );
    }

    const requesterOrgMembership =
      await this.prismaService.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: project.organizationId,
          },
        },
        select: {
          role: true,
          id: true,
          isActive: true,
        },
      });

    if (!requesterOrgMembership) {
      throw new ForbiddenException(
        'You are not an active member of this organization.',
      );
    }

    if (!requesterOrgMembership.isActive) {
      throw new ForbiddenException(
        'You are not an active member of this organization.',
      );
    }

    const allowedRoles: OrganizationMemberRole[] = [
      OrganizationMemberRole.OWNER,
      OrganizationMemberRole.ADMIN,
    ];

    const requesterWorkspaceMembership =
      await this.prismaService.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            userId,
            workspaceId: project.workspaceId,
          },
        },
        select: {
          role: true,
          id: true,
        },
      });

    const isWorkspaceAdmin =
      requesterWorkspaceMembership?.role === WorkspaceMemberRole.ADMIN;

    if (
      !allowedRoles.includes(requesterOrgMembership.role) &&
      !isWorkspaceAdmin
    ) {
      throw new ForbiddenException(
        'You do not have permission to add members to this project.',
      );
    }

    const requestedMemberIds = [...new Set(data.members)];

    const existingMembers = await this.prismaService.projectMember.findMany({
      where: {
        projectId: projectId,
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
        'All selected users are already members of this project.',
      );
    }

    const [organizationMembers, workspaceMembers] = await Promise.all([
      this.prismaService.organizationMember.findMany({
        where: {
          organizationId: project.organizationId,
          userId: {
            in: memberIdsToAdd,
          },
          isActive: true,
        },
        select: {
          userId: true,
        },
      }),

      this.prismaService.workspaceMember.findMany({
        where: {
          workspaceId: project.workspaceId,
          userId: {
            in: memberIdsToAdd,
          },
        },
        select: {
          userId: true,
        },
      }),
    ]);

    const organizationMemberIds = organizationMembers.map(
      (member) => member.userId,
    );

    const workspaceMemberSet = new Set(
      workspaceMembers.map((member) => member.userId),
    );

    const validMemberIds = organizationMemberIds.filter((memberId) =>
      workspaceMemberSet.has(memberId),
    );

    const validMemberSet = new Set(validMemberIds);

    const invalidMemberIds = memberIdsToAdd.filter(
      (memberId) => !validMemberSet.has(memberId),
    );

    if (invalidMemberIds.length) {
      throw new BadRequestException(
        'One or more users are not members of this organization or workspace.',
      );
    }

    await this.prismaService.projectMember.createMany({
      data: validMemberIds.map((memberId) => ({
        projectId,
        userId: memberId,
        role: ProjectMemberRole.MEMBER,
      })),
      skipDuplicates: true,
    });

    return {
      success: true,
      message: 'Project members added successfully.',
      addedCount: validMemberIds.length,
    };
  }
}
