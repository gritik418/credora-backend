import {
  Controller,
  Body,
  Param,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Request } from 'express';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreateTaskSchema from './schemas/create-task.schema';
import CreateTaskDto from './dto/create-task.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateTaskSchema)) data: CreateTaskDto,
    @Req() req: Request,
  ) {
    return this.tasksService.createTask(projectId, data, req);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTasks(@Param('projectId') projectId: string, @Req() req: Request) {
    return this.tasksService.getTasks(projectId, req);
  }
}
