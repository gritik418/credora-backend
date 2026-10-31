import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import {
  PaginationQuery,
  PaginationSchema,
} from 'src/common/schemas/pagination.schema';
import CreateTaskDto from './dto/create-task.dto';
import CreateTaskSchema from './schemas/create-task.schema';
import { TasksService } from './tasks.service';
import TaskQuerySchema from './schemas/task-query.schema';
import TaskQueryDto from './dto/task-query.dto';

@UseGuards(AuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateTaskSchema))
    data: CreateTaskDto,
    @Req() req: Request,
  ) {
    return this.tasksService.createTask(projectId, data, req);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTasks(
    @Param('projectId') projectId: string,
    @Req() req: Request,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationQuery,
    @Query(new ZodValidationPipe(TaskQuerySchema)) query: TaskQueryDto,
  ) {
    return this.tasksService.getTasks(projectId, req, pagination, query);
  }
}
