import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import CreateTaskDto from './dto/create-task.dto';
import { Request } from 'express';
import {
  OrganizationMemberRole,
  ProjectMemberRole,
  WorkspaceMemberRole,
} from 'generated/prisma/enums';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTask(projectId: string, data: CreateTaskDto, req: Request) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          select: {
            id: true,
            isActive: true,
          },
        },
        organization: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found.');

    if (!project.organization.isActive) {
      throw new ForbiddenException(
        'Cannot create tasks in an inactive organization.',
      );
    }

    if (!project.workspace.isActive) {
      throw new ForbiddenException(
        'Cannot create tasks in an inactive workspace.',
      );
    }

    const [projectMember, workspaceMember, organizationMember] =
      await Promise.all([
        this.prismaService.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId,
            },
          },
          select: {
            id: true,
            role: true,
          },
        }),
        this.prismaService.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: project.workspace.id,
              userId,
            },
          },
          select: {
            id: true,
            role: true,
          },
        }),
        this.prismaService.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              organizationId: project.organization.id,
              userId,
            },
          },
          select: {
            id: true,
            role: true,
          },
        }),
      ]);

    if (!projectMember && !workspaceMember && !organizationMember) {
      throw new ForbiddenException(
        'You are not authorized to create tasks in this project.',
      );
    }

    const isOrgOwnerOrAdmin =
      organizationMember?.role === OrganizationMemberRole.OWNER ||
      organizationMember?.role === OrganizationMemberRole.ADMIN;
    const isWorkspaceAdmin =
      workspaceMember?.role === WorkspaceMemberRole.ADMIN;
    const isProjectAdmin = projectMember?.role === ProjectMemberRole.ADMIN;

    if (!isProjectAdmin && !isWorkspaceAdmin && !isOrgOwnerOrAdmin) {
      throw new ForbiddenException(
        'You are not authorized to create tasks in this project.',
      );
    }

    await this.prismaService.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate,
        dueDate: data.dueDate,
        organizationId: project.organizationId,
        projectId: projectId,
        assignees: {
          createMany: {
            data: data.assignees.map((assignee) => {
              return {
                memberId: assignee,
                assignedAt: new Date(),
                assignerId: userId,
              };
            }),
          },
        },
        reviewRecipients: {
          createMany: {
            data: [...(data.reviewers || []), userId].map((reviewer) => {
              return {
                memberId: reviewer,
                isDefault: reviewer === userId,
              };
            }),
          },
        },
      },
    });

    return {
      success: true,
      message: 'Task created successfully.',
    };
  }

  async getTasks(projectId: string, req: Request) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          select: {
            id: true,
            isActive: true,
          },
        },
        organization: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found.');

    const [projectMember, workspaceMember, organizationMember] =
      await Promise.all([
        this.prismaService.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId,
            },
          },
          select: {
            id: true,
            role: true,
          },
        }),
        this.prismaService.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: project.workspace.id,
              userId,
            },
          },
          select: {
            id: true,
            role: true,
          },
        }),
        this.prismaService.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              organizationId: project.organization.id,
              userId,
            },
          },
          select: {
            id: true,
            role: true,
            isActive: true,
          },
        }),
      ]);

    if (!organizationMember?.isActive) {
      throw new ForbiddenException(
        'You are not authorized to view tasks in this project.',
      );
    }

    if (!projectMember && !workspaceMember && !organizationMember) {
      throw new ForbiddenException(
        'You are not authorized to view tasks in this project.',
      );
    }

    const isOrgOwnerOrAdmin =
      organizationMember?.role === OrganizationMemberRole.OWNER ||
      organizationMember?.role === OrganizationMemberRole.ADMIN;

    const isWorkspaceAdmin =
      workspaceMember?.role === WorkspaceMemberRole.ADMIN;

    if (!projectMember && !isWorkspaceAdmin && !isOrgOwnerOrAdmin) {
      throw new ForbiddenException(
        'You are not authorized to create tasks in this project.',
      );
    }

    const tasks = await this.prismaService.task.findMany({
      where: {
        projectId,
      },
      include: {
        assignees: true,
        reviewRecipients: true,
      },
    });

    return {
      success: true,
      message: 'Tasks fetched successfully.',
      tasks,
    };
  }
}
