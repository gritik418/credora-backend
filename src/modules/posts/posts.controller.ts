import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import CreatePostDto from './dto/create-post.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreatePostSchema from './schemas/create-post.schema';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaValidationPipe } from './pipes/media-validation/media-validation.pipe';
import { MediaFile } from './types/post-media.types';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('media'))
  create(
    @Body(new ZodValidationPipe(CreatePostSchema)) data: CreatePostDto,
    @UploadedFiles(new MediaValidationPipe())
    media: MediaFile[] | null,
    @Req() req: Request,
  ) {
    return this.postsService.createPost(data, media, req);
  }
}
