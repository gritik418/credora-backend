import {
  Body,
  Controller,
  Get,
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

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProjects(
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
  ) {
    return this.projectsService.getProjects(workspaceId, req);
  }

  @Get(':projectSlug')
  @HttpCode(HttpStatus.OK)
  async getProjectBySlug(
    @Param('projectSlug') projectSlug: string,
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
  ) {
    return this.projectsService.getProjectBySlug(projectSlug, workspaceId, req);
  }

  @Get(':projectId/reviewers')
  @HttpCode(HttpStatus.OK)
  async getReviewers(
    @Param('projectId') projectId: string,
    @Req() req: Request,
  ) {
    return this.projectsService.getAvailableReviewers(projectId, req);
  }
}
