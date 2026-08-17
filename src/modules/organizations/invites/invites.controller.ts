import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationInvitesService } from './invites.service';
import SendInviteDto from './dto/send-invite.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import SendInviteSchema from './schemas/send-invite.schema';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/invites')
export class OrganizationInvitesController {
  constructor(private readonly invitesService: OrganizationInvitesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendInvite(
    @Body(new ZodValidationPipe(SendInviteSchema)) data: SendInviteDto,
    @Req() req: Request,
  ) {
    return this.invitesService.sendInvite(data, req);
  }
}
