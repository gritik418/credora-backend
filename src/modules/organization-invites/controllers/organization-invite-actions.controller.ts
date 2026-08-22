import {
  Controller,
  Get,
  Param,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationInvitesService } from '../organization-invites.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('organization-invites/:inviteId')
export class OrganizationInviteActionsController {
  constructor(private readonly invitesService: OrganizationInvitesService) {}

  @Get(':token/accept')
  @Redirect()
  async acceptInvite(
    @Param('inviteId') inviteId: string,
    @Param('token') token: string,
    @Req() req: Request,
  ) {
    return this.invitesService.acceptInvite(inviteId, token, req);
  }
}
