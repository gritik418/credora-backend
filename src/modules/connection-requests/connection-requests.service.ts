import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import SendConnectionRequestDto from './dto/send-connection-request.dto';
import {
  ConnectionRequestStatus,
  EntityType,
  NotificationType,
} from 'generated/prisma/enums';

@Injectable()
export class ConnectionRequestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendConnectionRequest(data: SendConnectionRequestDto, req: Request) {
    const senderId = req.user.id;

    if (!senderId) throw new UnauthorizedException('Unauthorized.');

    const sender = await this.prismaService.user.findUnique({
      where: {
        id: senderId,
      },
      select: {
        name: true,
        avatar: true,
        username: true,
      },
    });

    if (!sender) throw new BadRequestException('Sender not found.');

    const receiver = await this.prismaService.user.findUnique({
      where: {
        id: data.receiverId,
      },
    });

    if (!receiver) throw new BadRequestException('Receiver not found.');

    if (!receiver.isActive)
      throw new BadRequestException('This account does not exist.');

    if (senderId === data.receiverId) {
      throw new BadRequestException(
        'You cannot send a connection request to yourself.',
      );
    }

    const connection = await this.prismaService.connection.findFirst({
      where: {
        OR: [
          { userOneId: senderId, userTwoId: data.receiverId },
          { userOneId: data.receiverId, userTwoId: senderId },
        ],
      },
    });

    if (connection) {
      throw new BadRequestException('Connection already exists.');
    }

    const existingRequest =
      await this.prismaService.connectionRequest.findFirst({
        where: {
          senderId,
          receiverId: data.receiverId,
          status: ConnectionRequestStatus.PENDING,
        },
      });

    if (existingRequest) {
      throw new BadRequestException(
        'You have already sent a connection request to this user.',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      const connectionRequest = await tx.connectionRequest.create({
        data: {
          senderId,
          receiverId: data.receiverId,
          status: ConnectionRequestStatus.PENDING,
          message: data.message,
        },
      });

      await tx.notification.create({
        data: {
          recipientId: data.receiverId,
          type: NotificationType.CONNECTION_REQUEST_RECEIVED,
          title: 'New Connection Request',
          message: `${sender.name} sent you a connection request.`,
          actorId: senderId,
          entityId: connectionRequest.id,
          entityType: EntityType.CONNECTION_REQUEST,
        },
      });
    });

    return {
      success: true,
      message: 'Connection request sent successfully.',
    };
  }

  async getConnectionRequests(req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const connectionRequests =
      await this.prismaService.connectionRequest.findMany({
        where: {
          receiverId: userId,
          status: ConnectionRequestStatus.PENDING,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

    return {
      success: true,
      message: 'Connection requests fetched successfully.',
      data: { connectionRequests },
    };
  }

  async acceptConnectionRequest(requestId: string, req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const connectionRequest =
      await this.prismaService.connectionRequest.findUnique({
        where: {
          id: requestId,
        },
      });

    if (!connectionRequest)
      throw new BadRequestException('Connection request not found.');

    if (connectionRequest.receiverId !== userId) {
      throw new BadRequestException(
        'You are not authorized to accept this connection request.',
      );
    }

    if (connectionRequest.status === ConnectionRequestStatus.EXPIRED) {
      throw new BadRequestException('Connection request has expired.');
    }

    if (connectionRequest.status !== ConnectionRequestStatus.PENDING) {
      throw new BadRequestException(
        'Connection request is not pending. It might be already accepted or rejected.',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.connectionRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: ConnectionRequestStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });

      const isConnectionRequestToSameUser =
        await tx.connectionRequest.findFirst({
          where: {
            senderId: connectionRequest.receiverId,
            receiverId: connectionRequest.senderId,
            status: ConnectionRequestStatus.PENDING,
          },
        });

      if (isConnectionRequestToSameUser) {
        await tx.connectionRequest.update({
          where: {
            id: isConnectionRequestToSameUser.id,
          },
          data: {
            status: ConnectionRequestStatus.ACCEPTED,
            respondedAt: new Date(),
          },
        });
      }

      await tx.connection.create({
        data: {
          userOneId: connectionRequest.senderId,
          userTwoId: connectionRequest.receiverId,
        },
      });
    });

    return {
      success: true,
      message: 'Connection request accepted successfully.',
    };
  }

  async rejectConnectionRequest(requestId: string, req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const connectionRequest =
      await this.prismaService.connectionRequest.findUnique({
        where: {
          id: requestId,
        },
      });

    if (!connectionRequest)
      throw new BadRequestException('Connection request not found.');

    if (connectionRequest.receiverId !== userId) {
      throw new BadRequestException(
        'You are not authorized to reject this connection request.',
      );
    }

    if (connectionRequest.status === ConnectionRequestStatus.EXPIRED) {
      throw new BadRequestException('Connection request has expired.');
    }

    if (connectionRequest.status !== ConnectionRequestStatus.PENDING) {
      throw new BadRequestException(
        'Connection request is not pending. It might be already accepted or rejected.',
      );
    }

    await this.prismaService.connectionRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: ConnectionRequestStatus.DECLINED,
        respondedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Connection request declined successfully.',
    };
  }
}
