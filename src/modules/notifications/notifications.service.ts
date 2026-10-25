import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateNotificationPayload } from './interfaces/notifications.interface';
import { Request } from 'express';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(data: CreateNotificationPayload) {
    const receipient = await this.prismaService.user.findUnique({
      where: {
        id: data.recipientId,
      },
    });

    if (!receipient) {
      throw new BadRequestException('Recipient not found.');
    }

    const notification = await this.prismaService.notification.create({
      data: {
        recipientId: data.recipientId,
        type: data.type,
        title: data.title,
        message: data.message,
        actorId: data.notificationActorId,
        entityId: data.entity?.id,
        entityType: data.entity?.type,
        actionUrl: data.actionUrl,
        expiresAt: data.expiresAt,
      },
    });

    if (notification.id) {
      return notification;
    }

    throw new BadRequestException('Failed to create notification.');
  }

  async getNotifications(req: Request) {
    const userId = req.user.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const notifications = await this.prismaService.notification.findMany({
      where: {
        recipientId: userId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Notifications fetched successfully.',
      data: { notifications },
    };
  }
}
