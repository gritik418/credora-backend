import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceMember } from 'generated/prisma/browser';
import {
  OrganizationMemberRole,
  ProjectMemberRole,
  ProjectStatus,
  WorkspaceMemberRole,
  WorkspaceStatus,
} from 'generated/prisma/enums';
import { PrismaService } from 'src/database/prisma.service';
import CreateProjectDto from './dto/create-project.dto';
import { Project, User } from 'generated/prisma/client';

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
    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new NotFoundException('Workspace not found or is archived.');

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

    const project = await this.prismaService.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description,
          slug: data.slug,
          dueDate: data.dueDate,
          startDate: data.startDate,
          status: ProjectStatus.ACTIVE,
          organizationId: workspace.organizationId,
          workspaceId,
          createdById: userId,
          createdAt: new Date(),
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: ProjectMemberRole.ADMIN,
        },
      });

      return project;
    });

    return {
      success: true,
      message: 'Project created successfully.',
      data: {
        project,
      },
    };
  }

  async getProjects(workspaceId: string, req: Request) {
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

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new NotFoundException('Workspace not found or is archived.');

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
        'You are not authorized to view projects in this workspace.',
      );

    if (!organizationMember.isActive)
      throw new ForbiddenException(
        'Your account is inactive. Please contact the organization admin to activate your account.',
      );

    const isOrgAdminOrOwner =
      organizationMember.role === OrganizationMemberRole.ADMIN ||
      organizationMember.role === OrganizationMemberRole.OWNER;

    if (!isOrgAdminOrOwner && !member) {
      throw new ForbiddenException(
        'You are not authorized to view projects in this workspace.',
      );
    }

    let projects: Project[] = [];

    if (isOrgAdminOrOwner || member?.role === WorkspaceMemberRole.ADMIN) {
      projects = await this.prismaService.project.findMany({
        where: {
          workspaceId,
        },
        include: {
          workspace: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              logo: true,
              status: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    } else {
      projects = await this.prismaService.project.findMany({
        where: {
          workspaceId,
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          workspace: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              logo: true,
              status: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    }
    return {
      success: true,
      message: 'Projects fetched successfully.',
      data: {
        projects,
      },
    };
  }

  async getProjectBySlug(
    projectSlug: string,
    workspaceId: string,
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

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new NotFoundException('Workspace not found or is archived.');

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
        'You are not authorized to view projects in this workspace.',
      );

    if (!organizationMember.isActive)
      throw new ForbiddenException(
        'Your account is inactive. Please contact the organization admin to activate your account.',
      );

    const isOrgAdminOrOwner =
      organizationMember.role === OrganizationMemberRole.ADMIN ||
      organizationMember.role === OrganizationMemberRole.OWNER;

    if (!isOrgAdminOrOwner && !member) {
      throw new ForbiddenException(
        'You are not authorized to view projects in this workspace.',
      );
    }

    const project = await this.prismaService.project.findFirst({
      where: {
        workspaceId,
        slug: projectSlug,
      },
      include: {
        workspace: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            logo: true,
            status: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found.');

    const projectMember = await this.prismaService.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId,
        },
      },
    });

    if (
      !projectMember &&
      !isOrgAdminOrOwner &&
      member?.role !== WorkspaceMemberRole.ADMIN
    )
      throw new ForbiddenException(
        'You are not authorized to view this project.',
      );

    return {
      success: true,
      message: 'Project fetched successfully.',
      data: {
        project,
      },
    };
  }

  async getAvailableReviewers(projectId: string, req: Request) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found.');

    const [workspaceMember, organizationMember, projectMember] =
      await Promise.all([
        this.prismaService.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: project.workspaceId,
              userId,
            },
          },
        }),
        this.prismaService.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              organizationId: project.organizationId,
              userId,
            },
          },
        }),
        this.prismaService.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId,
            },
          },
        }),
      ]);

    if (!organizationMember)
      throw new ForbiddenException(
        'You are not authorized to view projects in this workspace.',
      );

    if (!organizationMember.isActive)
      throw new ForbiddenException(
        'Your account is inactive. Please contact the organization admin to activate your account.',
      );

    if (!organizationMember && !workspaceMember && !projectMember)
      throw new ForbiddenException(
        'You are not authorized to view this project.',
      );

    const isOrgAdminOrOwner =
      organizationMember.role === OrganizationMemberRole.ADMIN ||
      organizationMember.role === OrganizationMemberRole.OWNER;

    const isWorkspaceAdmin =
      workspaceMember?.role === WorkspaceMemberRole.ADMIN;

    const isProjectAdmin = projectMember?.role === ProjectMemberRole.ADMIN;

    if (!isOrgAdminOrOwner && !isWorkspaceAdmin && !isProjectAdmin) {
      throw new ForbiddenException(
        'You are not authorized to view reviewers in this project.',
      );
    }

    const [projectAdmins, workspaceAdmins, organizationAdmins] =
      await Promise.all([
        this.prismaService.projectMember.findMany({
          where: {
            projectId,
            role: ProjectMemberRole.ADMIN,
          },
        }),
        this.prismaService.workspaceMember.findMany({
          where: {
            workspaceId: project.workspaceId,
            role: WorkspaceMemberRole.ADMIN,
          },
        }),
        this.prismaService.organizationMember.findMany({
          where: {
            organizationId: project.organizationId,
            role: {
              in: [OrganizationMemberRole.ADMIN, OrganizationMemberRole.OWNER],
            },
            isActive: true,
          },
        }),
      ]);

    const reviewerIds: string[] = [];

    projectAdmins.forEach((admin) => {
      if (admin.userId !== userId) {
        reviewerIds.push(admin.userId);
      }
    });

    workspaceAdmins.forEach((admin) => {
      if (admin.userId !== userId) {
        reviewerIds.push(admin.userId);
      }
    });

    organizationAdmins.forEach((admin) => {
      if (admin.userId !== userId) {
        reviewerIds.push(admin.userId);
      }
    });

    const uniqueReviewers = [...new Set(reviewerIds)];

    const reviewers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: uniqueReviewers,
        },
        isActive: true,
        isEmailVerified: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
      },
    });

    return {
      success: true,
      message: 'Reviewers fetched successfully.',
      data: {
        reviewers,
      },
    };
  }

  async getAvailableAssignees(projectId: string, req: Request) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found.');

    const [workspaceMember, organizationMember, projectMember] =
      await Promise.all([
        this.prismaService.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: project.workspaceId,
              userId,
            },
          },
        }),
        this.prismaService.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              organizationId: project.organizationId,
              userId,
            },
          },
        }),
        this.prismaService.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId,
            },
          },
        }),
      ]);

    if (!organizationMember)
      throw new ForbiddenException(
        'You are not authorized to view projects in this workspace.',
      );

    if (!organizationMember.isActive)
      throw new ForbiddenException(
        'Your account is inactive. Please contact the organization admin to activate your account.',
      );

    if (!organizationMember && !workspaceMember && !projectMember)
      throw new ForbiddenException(
        'You are not authorized to view this project.',
      );

    const isOrgAdminOrOwner =
      organizationMember.role === OrganizationMemberRole.ADMIN ||
      organizationMember.role === OrganizationMemberRole.OWNER;

    const isWorkspaceAdmin =
      workspaceMember?.role === WorkspaceMemberRole.ADMIN;

    const isProjectAdmin = projectMember?.role === ProjectMemberRole.ADMIN;

    if (!isOrgAdminOrOwner && !isWorkspaceAdmin && !isProjectAdmin) {
      throw new ForbiddenException(
        'You are not authorized to view assignees in this project.',
      );
    }

    const projectMembers = await this.prismaService.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Assignees fetched successfully.',
      data: {
        assignees: projectMembers,
      },
    };
  }
}
