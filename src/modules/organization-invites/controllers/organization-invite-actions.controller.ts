import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { OrganizationInvitesService } from '../organization-invites.service';

@UseGuards(AuthGuard)
@Controller('organization-invites/:inviteId')
export class OrganizationInviteActionsController {
  constructor(private readonly invitesService: OrganizationInvitesService) {}

  @Patch('accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvite(@Param('inviteId') inviteId: string, @Req() req: Request) {
    return this.invitesService.acceptInvite(inviteId, req);
  }

  @Patch('decline')
  @HttpCode(HttpStatus.OK)
  async declineInvite(
    @Param('inviteId') inviteId: string,
    @Req() req: Request,
  ) {
    return this.invitesService.declineInvite(inviteId, req);
  }
}
