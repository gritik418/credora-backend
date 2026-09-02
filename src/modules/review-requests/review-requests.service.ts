import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TaskReviewStatus, TaskStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/database/prisma.service';
import RaiseReviewRequestDto from './dto/raise-review-request.dto';
import { success } from 'zod';

@Injectable()
export class ReviewRequestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async raiseReviewRequest(
    taskId: string,
    data: RaiseReviewRequestDto,
    req: Request,
  ) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    if (!taskId) throw new BadRequestException('Task ID is required.');

    const task = await this.prismaService.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        organization: {
          include: {
            organizationMembers: {
              where: {
                userId,
              },
              select: {
                id: true,
                isActive: true,
              },
            },
          },
        },
        project: {
          include: {
            members: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!task) throw new BadRequestException('Task not found.');

    if (!task.organization.isActive) {
      throw new BadRequestException('Organization is not active.');
    }

    if (!task.organization.organizationMembers.length) {
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );
    }

    if (!task.organization.organizationMembers[0].isActive) {
      throw new ForbiddenException(
        'You are not an active member of this organization.',
      );
    }

    if (!task.project) {
      throw new BadRequestException('Task is not associated with any project.');
    }

    if (!task.project.members.length) {
      throw new ForbiddenException('You are not a member of this project.');
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException(
        'Task is already completed. Cannot request for review.',
      );
    }

    if (task.status === TaskStatus.CANCELLED) {
      throw new BadRequestException(
        'Task is cancelled. Cannot request for review.',
      );
    }

    await this.prismaService.taskReviewRequest.create({
      data: {
        message: data.message,
        requesterId: userId,
        taskId,
        requestedAt: new Date(),
        status: TaskReviewStatus.PENDING,
      },
    });

    return {
      success: true,
      message: 'Review request raised successfully.',
    };
  }
}
