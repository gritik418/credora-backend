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
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { OrganizationInvitesService } from '../organization-invites.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import SendInviteSchema from '../schemas/send-invite.schema';
import SendInviteDto from '../dto/send-invite.dto';
import { Request } from 'express';

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

  @Post(':inviteId/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeInvite(@Param('inviteId') inviteId: string, @Req() req: Request) {
    return this.invitesService.revokeInvite(inviteId, req);
  }

  @Post(':inviteId/resend')
  @HttpCode(HttpStatus.OK)
  async resendInvite(@Param('inviteId') inviteId: string, @Req() req: Request) {
    return this.invitesService.resendInvite(inviteId, req);
  }
}
