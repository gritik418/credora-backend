import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PostStatus } from 'generated/prisma/browser';
import { PrismaService } from 'src/database/prisma.service';
import { CloudinaryFolders } from 'src/providers/cloudinary/cloudinary.constants';
import { CustomUploadResult } from 'src/providers/cloudinary/cloudinary.interface';
import { CloudinaryService } from 'src/providers/cloudinary/cloudinary.service';
import CreatePostDto from './dto/create-post.dto';
import { MediaFile, MediaType } from './types/post-media.types';

@Injectable()
export class PostsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createPost(
    data: CreatePostDto,
    media: MediaFile[] | null,
    req: Request,
  ) {
    const userId = req.user.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    if ((!media || !media.length) && !data.content?.trim()) {
      throw new BadRequestException('Media or content is required.');
    }

    const hashtags = await this.processHashtags(data.hashtags || []);

    const uploadedMedia = media?.length ? await this.uploadMedia(media) : [];

    const post = await this.prismaService.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          content: data.content,
          authorId: userId,
          commentPermission: data.commentPermission,
          visibility: data.visibility,
          status: PostStatus.PUBLISHED,
        },
      });

      if (hashtags.length) {
        await tx.postHashtag.createMany({
          data: hashtags.map((hashtag) => ({
            postId: post.id,
            hashtagId: hashtag.id,
          })),
          skipDuplicates: true,
        });
      }

      if (uploadedMedia.length) {
        await tx.postMedia.createMany({
          data: uploadedMedia.map((uploaded, index) => ({
            postId: post.id,
            type: uploaded.mediaFile.mediaType,
            url: uploaded.secure_url,
            fileName: uploaded.mediaFile.originalname,
            fileSize: uploaded.mediaFile.size,
            position: index,
            publicId: uploaded.public_id,
          })),
        });
      }

      return post;
    });

    return {
      success: true,
      message: 'Post created successfully.',
      data: post,
    };
  }

  private async processHashtags(hashtags: string[]) {
    if (!hashtags || !hashtags.length) return [];

    const existingHashtags = await this.prismaService.hashtag.findMany({
      where: { name: { in: hashtags } },
    });

    const newHashtags = hashtags.filter(
      (tag) => !existingHashtags.some((ht) => ht.name === tag),
    );

    const createdHashtags = await this.createHashtags(newHashtags);

    return [...existingHashtags, ...createdHashtags];
  }

  private async createHashtags(hashtags: string[]) {
    if (!hashtags || !hashtags.length) return [];

    const batchPayload = await this.prismaService.hashtag.createMany({
      data: hashtags.map((tag) => ({
        name: tag,
        slug: tag.toLowerCase(),
      })),
      skipDuplicates: true,
    });

    if (batchPayload.count === 0) return [];

    const createdHashtags = await this.prismaService.hashtag.findMany({
      where: { name: { in: hashtags } },
    });

    return createdHashtags;
  }

  private async uploadMedia(media: MediaFile[]): Promise<CustomUploadResult[]> {
    if (!media || !media.length) return [];

    const uploadedMedia: CustomUploadResult[] = [];

    for (const mediaFile of media) {
      const folder = this.getFolderName(mediaFile.mediaType);

      if (!folder) continue;

      const postMedia = await this.cloudinaryService.uploadFile(
        mediaFile,
        folder,
      );

      uploadedMedia.push(postMedia);
    }

    return uploadedMedia;
  }

  private getFolderName(mediaType: MediaType) {
    switch (mediaType) {
      case MediaType.IMAGE:
        return CloudinaryFolders.POST_IMAGES;
      case MediaType.VIDEO:
        return CloudinaryFolders.POST_VIDEOS;
      case MediaType.DOCUMENT:
        return CloudinaryFolders.POST_DOCUMENTS;

      default:
        return null;
    }
  }
}
