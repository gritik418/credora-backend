import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreateContributionRequestDto from './dto/create-contribution-request.dto';
import CreateContributionRequestSchema from './schemas/create-contribution-request.schema';
import { TaskContributionsService } from './task-contributions.service';

@UseGuards(AuthGuard)
@Controller('task-contributions')
export class TaskContributionsController {
  constructor(
    private readonly taskContributionsService: TaskContributionsService,
  ) {}

  @Post('request/:taskId')
  @HttpCode(HttpStatus.CREATED)
  async createContributionRequest(
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(CreateContributionRequestSchema))
    data: CreateContributionRequestDto,
    @Req() req: Request,
  ) {
    return this.taskContributionsService.createContributionRequest(
      taskId,
      data,
      req,
    );
  }
}
