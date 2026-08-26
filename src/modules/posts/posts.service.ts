import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import CreatePostDto from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(data: CreatePostDto, media: { file: File }[], req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    if (!media.length && !data.content)
      throw new BadRequestException('Media or content is required.');

    const hashtags = data.hashtags.map((tag) => ({ name: tag }));
  }

  private uploadMedia(media: File[]) {}
}
