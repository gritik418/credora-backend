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
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreateWorkspaceDto from './dto/create-workspace.dto';
import CreateWorkspaceSchema from './schemas/create-workspace.schema';
import { WorkspacesService } from './workspaces.service';

@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(
    @Param('organizationId') organizationId: string,
    @Body(new ZodValidationPipe(CreateWorkspaceSchema))
    data: CreateWorkspaceDto,
    @Req() req: Request,
  ) {
    return this.workspacesService.createWorkspace(organizationId, data, req);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getWorkspaces(
    @Param('organizationId') organizationId: string,
    @Req() req: Request,
  ) {
    return this.workspacesService.getWorkspaces(organizationId, req);
  }
}
