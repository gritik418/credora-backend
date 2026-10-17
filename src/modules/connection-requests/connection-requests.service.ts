import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import SendConnectionRequestDto from './dto/send-connection-request.dto';
import { ConnectionRequestStatus } from 'generated/prisma/enums';

@Injectable()
export class ConnectionRequestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendConnectionRequest(data: SendConnectionRequestDto, req: Request) {
    const senderId = req.user.id;

    if (!senderId) throw new UnauthorizedException('Unauthorized.');

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

    await this.prismaService.connectionRequest.create({
      data: {
        senderId,
        receiverId: data.receiverId,
        status: ConnectionRequestStatus.PENDING,
        message: data.message,
      },
    });

    return {
      success: true,
      message: 'Connection request sent successfully.',
    };
  }
}
