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
import AddProjectMembersDto from './dto/add-project-members.dto';
import { ProjectMembersService } from './project-members.service';
import { Request } from 'express';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import AddProjectMembersSchema from './schemas/add-project-members.schema';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async addMembers(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(AddProjectMembersSchema))
    data: AddProjectMembersDto,
    @Req() req: Request,
  ) {
    return this.projectMembersService.addMembers(projectId, data, req);
  }
}
