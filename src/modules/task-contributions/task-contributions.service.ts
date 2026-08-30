import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import CreateContributionRequestDto from './dto/create-contribution-request.dto';
import { ContributionStatus, TaskStatus } from 'generated/prisma/enums';

@Injectable()
export class TaskContributionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createContributionRequest(
    taskId: string,
    data: CreateContributionRequestDto,
    req: Request,
  ) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    if (!taskId) throw new BadRequestException('Task ID is required.');

    const task = await this.prismaService.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        organization: {
          select: {
            organizationMembers: {
              where: {
                userId,
              },
              select: {
                isActive: true,
                id: true,
              },
            },
          },
        },
        assignees: {
          where: {
            memberId: userId,
          },
        },
      },
    });

    if (!task) throw new BadRequestException('Task not found.');

    const userIsOrganizationMember =
      task.organization?.organizationMembers.length > 0;

    if (!userIsOrganizationMember) {
      throw new ForbiddenException(
        'User is not a member of this organization.',
      );
    }

    if (!task.organization?.organizationMembers[0].isActive) {
      throw new ForbiddenException(
        'User is not an active member of this organization.',
      );
    }

    if (!task.assignees.length) {
      throw new BadRequestException(
        'Only assigned members can contribute to this task.',
      );
    }

    if (task.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException(
        'Task must be completed to request for contribution.',
      );
    }

    await this.prismaService.taskContributionRequest.create({
      data: {
        taskId: task.id,
        requesterId: userId,
        requestedAt: new Date(),
        contribution: data.contribution,
        message: data.message,
        status: ContributionStatus.PENDING,
      },
    });

    return {
      success: true,
      message: 'Contribution request created successfully.',
    };
  }
}
