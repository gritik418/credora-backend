import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';

interface Connection {
  id: string;
  userId: string;

  connection: {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar: string | null;
  };
  createdAt: Date;
}

@Injectable()
export class ConnectionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getConnections(req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        connectionsAsUserOne: {
          include: {
            userTwo: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        connectionsAsUserTwo: {
          include: {
            userOne: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Unauthorized.');

    const connections = [
      ...user.connectionsAsUserOne.map((connection) => {
        return {
          id: connection.id,
          userId: user.id,
          connection: connection.userTwo,
          createdAt: connection.createdAt,
        };
      }),

      ...user.connectionsAsUserTwo.map((connection) => {
        return {
          id: connection.id,
          userId: user.id,
          connection: connection.userOne,
          createdAt: connection.createdAt,
        };
      }),
    ];

    return {
      success: true,
      message: 'Connections fetched successfully.',
      data: { connections },
    };
  }
}
