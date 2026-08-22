import { Module } from '@nestjs/common';
import { HashingModule } from 'src/common/hashing/hashing.module';
import { QueueModule } from 'src/queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationInvitesController } from './controllers/organization-invites.controller';
import { OrganizationInvitesService } from './organization-invites.service';
import { OrganizationInviteActionsController } from './controllers/organization-invite-actions.controller';

@Module({
  imports: [HashingModule, QueueModule, AuthModule],
  controllers: [
    OrganizationInvitesController,
    OrganizationInviteActionsController,
  ],
  providers: [OrganizationInvitesService],
})
export class OrganizationInvitesModule {}
