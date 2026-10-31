import {
  BadRequestException,
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
  WorkspaceStatus,
} from 'generated/prisma/enums';
import { PaginationQuery } from 'src/common/schemas/pagination.schema';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Task } from 'generated/prisma/client';
import TaskQueryDto from './dto/task-query.dto';

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
            status: true,
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

    if (project.workspace.status !== WorkspaceStatus.ACTIVE) {
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

    const validatedAssignees = await this.validateAssignees(
      data.assignees,
      projectId,
    );

    const validatedReviewers = await this.validateReviewers(
      [...new Set([...(data.reviewers ?? []), userId])],
      projectId,
      project.workspaceId,
      project.organizationId,
    );

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
        labels: data.labels,
        assignees: {
          createMany: {
            data: validatedAssignees.map((assignee) => {
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
            data: validatedReviewers.map((reviewer) => {
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

  async getTasks(
    projectId: string,
    req: Request,
    pagination: PaginationQuery,
    query: TaskQueryDto,
  ) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          select: {
            id: true,
            status: true,
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

    const limit = pagination.limit ?? 10;
    const page = pagination.page ?? 1;
    const skip = (page - 1) * limit;

    const search = query.search;
    const status = query.status;
    const priority = query.priority;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    const where: Record<string, object | string> = { projectId };
    const orderBy: Record<string, 'asc' | 'desc'> = {};

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (sortBy || sortOrder) {
      const order: 'asc' | 'desc' = sortOrder ?? 'desc';
      const sortKey = sortBy ?? 'createdAt';

      orderBy[sortKey] = order;
    }

    const [tasks, totalTasks] = await Promise.all([
      this.prismaService.task.findMany({
        where,
        take: limit,
        skip,
        include: {
          assignees: true,
          reviewRecipients: true,
        },
        orderBy,
      }),
      this.prismaService.task.count({
        where,
      }),
    ]);

    const data: PaginatedResponse<Task[]> = {
      data: tasks,
      meta: {
        limit,
        page,
        total: totalTasks,
        totalPages: Math.ceil(totalTasks / limit),
      },
    };

    return {
      success: true,
      message: 'Tasks fetched successfully.',
      data,
    };
  }

  async validateAssignees(assignees: string[], projectId: string) {
    const uniqueIds = [...new Set(assignees)];

    const validated: string[] = [];

    for (const assignee of uniqueIds) {
      const [isValidUser, isProjectMember] = await Promise.all([
        this.prismaService.user.findUnique({
          where: {
            id: assignee,
            isActive: true,
            isEmailVerified: true,
          },
          select: {
            id: true,
          },
        }),
        this.prismaService.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: assignee,
            },
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (isValidUser && isProjectMember) {
        validated.push(assignee);
      }
    }

    if (validated.length !== uniqueIds.length) {
      throw new BadRequestException(
        'Some assignees are either not found or not a part of the project.',
      );
    }

    return validated;
  }

  async validateReviewers(
    reviewers: string[],
    projectId: string,
    workspaceId: string,
    organizationId: string,
  ) {
    const uniqueIds = [...new Set(reviewers)];

    const validated: string[] = [];

    for (const reviewer of uniqueIds) {
      const [
        isValidUser,
        isProjectAdmin,
        isWorkspaceAdmin,
        isOrgOwnerAdminOrManager,
      ] = await Promise.all([
        this.prismaService.user.findUnique({
          where: {
            id: reviewer,
            isActive: true,
            isEmailVerified: true,
          },
          select: {
            id: true,
          },
        }),
        this.prismaService.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: reviewer,
            },
            role: ProjectMemberRole.ADMIN,
          },
          select: {
            id: true,
          },
        }),
        this.prismaService.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: reviewer,
            },
            role: WorkspaceMemberRole.ADMIN,
          },
          select: {
            id: true,
          },
        }),
        this.prismaService.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              organizationId,
              userId: reviewer,
            },
            role: {
              in: [
                OrganizationMemberRole.OWNER,
                OrganizationMemberRole.ADMIN,
                OrganizationMemberRole.MANAGER,
              ],
            },
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (
        isValidUser &&
        (isProjectAdmin || isWorkspaceAdmin || isOrgOwnerAdminOrManager)
      ) {
        validated.push(reviewer);
      }
    }

    if (validated.length !== uniqueIds.length) {
      throw new BadRequestException(
        'Some reviewers are either not found or not authorized to review tasks.',
      );
    }

    return validated;
  }
}
