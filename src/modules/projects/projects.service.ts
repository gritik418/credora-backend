import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import CreateProjectDto from './dto/create-project.dto';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import {
  OrganizationMemberRole,
  ProjectStatus,
  WorkspaceMemberRole,
} from 'generated/prisma/enums';
import { WorkspaceMember } from 'generated/prisma/browser';

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProject(
    workspaceId: string,
    data: CreateProjectDto,
    req: Request,
  ) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found.');

    const member: WorkspaceMember | null = workspace.members.length
      ? workspace.members[0]
      : null;

    const organizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            organizationId: workspace.organizationId,
            userId,
          },
        },
      });

    if (!organizationMember)
      throw new ForbiddenException(
        'You are not authorized to create a project in this workspace.',
      );

    if (!organizationMember.isActive)
      throw new ForbiddenException(
        'Your account is inactive. Please contact the organization admin to activate your account.',
      );

    const isOrgAdminOrOwner =
      organizationMember.role === OrganizationMemberRole.ADMIN ||
      organizationMember.role === OrganizationMemberRole.OWNER;

    if (!isOrgAdminOrOwner && member?.role !== WorkspaceMemberRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to create a project in this workspace.',
      );
    }

    const existingProject = await this.prismaService.project.findFirst({
      where: {
        workspaceId,
        slug: data.slug,
      },
    });

    if (existingProject)
      throw new BadRequestException('Project slug already exists.');

    const project = await this.prismaService.project.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        logo: data.logo,
        dueDate: data.dueDate,
        startDate: data.startDate,
        status: ProjectStatus.ACTIVE,
        organizationId: workspace.organizationId,
        workspaceId,
        createdById: userId,
        createdAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Project created successfully.',
      project,
    };
  }
}
