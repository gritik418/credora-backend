import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ReviewRequestsService } from './review-requests.service';
import RaiseReviewRequestDto from './dto/raise-review-request.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import RaiseReviewRequestSchema from './schemas/raise-review-request.schema';

@UseGuards(AuthGuard)
@Controller('review-requests')
export class ReviewRequestsController {
  constructor(private readonly reviewRequestsService: ReviewRequestsService) {}

  @Post('/raise/:taskId')
  async raiseReviewRequest(
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(RaiseReviewRequestSchema))
    data: RaiseReviewRequestDto,
    @Req() req: Request,
  ) {
    return await this.reviewRequestsService.raiseReviewRequest(
      taskId,
      data,
      req,
    );
  }
}
