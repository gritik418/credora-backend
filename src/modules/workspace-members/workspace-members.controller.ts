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
import { WorkspaceMembersService } from './workspace-members.service';
import { Request } from 'express';
import AddWorkspaceMembersDto from './dto/add-workspace-members.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import AddWorkspaceMembersSchema from './schemas/add-workspace-members.schema';

@Controller('workspaces/:workspaceId/members')
@UseGuards(AuthGuard)
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async addWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodValidationPipe(AddWorkspaceMembersSchema))
    data: AddWorkspaceMembersDto,
    @Req() req: Request,
  ) {
    return this.workspaceMembersService.addWorkspaceMember(
      workspaceId,
      data,
      req,
    );
  }
}
