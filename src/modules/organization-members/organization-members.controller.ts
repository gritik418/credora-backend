import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OrganizationMembersService } from './organization-members.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/members')
export class OrganizationMembersController {
  constructor(
    private readonly organizationMembersService: OrganizationMembersService,
  ) {}

  @Get()
  getMembers(
    @Param('organizationId') organizationId: string,
    @Req() req: Request,
  ) {
    return this.organizationMembersService.getMembers(organizationId, req);
  }
}
