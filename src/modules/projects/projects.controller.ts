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
import { ProjectsService } from './projects.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreateProjectSchema from './schemas/create-project.schema';
import CreateProjectDto from './dto/create-project.dto';
import { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodValidationPipe(CreateProjectSchema)) data: CreateProjectDto,
    @Req() req: Request,
  ) {
    return this.projectsService.createProject(workspaceId, data, req);
  }
}
