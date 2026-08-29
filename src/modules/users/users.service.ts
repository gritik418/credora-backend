import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import { CloudinaryFolders } from 'src/providers/cloudinary/cloudinary.constants';
import { CustomUploadResult } from 'src/providers/cloudinary/cloudinary.interface';
import { CloudinaryService } from 'src/providers/cloudinary/cloudinary.service';
import UpdateUsernameDto from './dto/update-username.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getMe(req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        role: true,
        profile: {
          select: {
            id: true,
            headline: true,
            profession: true,
            industry: true,
            bio: true,
            city: true,
            state: true,
            country: true,
            website: true,
            linkedinUrl: true,
            githubUrl: true,
            skills: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            isOpenToWork: true,
            isOpenToCollaborate: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    return {
      success: true,
      message: 'User fetched successfully',
      user,
    };
  }

  async updateUsername(data: UpdateUsernameDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    if (user.username === data.username) {
      return {
        success: true,
        message: 'Username is same as previous.',
      };
    }

    const isUsernameTaken = await this.prismaService.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (isUsernameTaken)
      throw new BadRequestException('Username already taken.');

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          username: data.username,
        },
      });
    });

    return {
      success: true,
      message: 'Username updated successfully.',
    };
  }

  async uploadAvatar(
    file: Express.Multer.File,
    isExistingAvatar: boolean,
    publicId: string | undefined,
  ): Promise<CustomUploadResult> {
    if (isExistingAvatar && publicId) {
      await this.cloudinaryService.deleteFile(publicId);
    }

    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      CloudinaryFolders.USER_AVATARS,
    );

    return uploadResult;
  }
}
