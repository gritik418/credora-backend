import { Module } from '@nestjs/common';
import { ReviewRequestsController } from './review-requests.controller';
import { ReviewRequestsService } from './review-requests.service';

@Module({
  controllers: [ReviewRequestsController],
  providers: [ReviewRequestsService]
})
export class ReviewRequestsModule {}
