import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationAuthController } from './auth/auth.controller';
import { OrganizationAuthService } from './auth/auth.service';
import { OrganizationInvitesController } from './invites/invites.controller';
import { OrganizationInvitesService } from './invites/invites.service';
import { HashingModule } from 'src/common/hashing/hashing.module';
import { JwtModule } from '@nestjs/jwt';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [HashingModule, JwtModule, QueueModule],
  controllers: [
    OrganizationsController,
    OrganizationAuthController,
    OrganizationInvitesController,
  ],
  providers: [
    OrganizationsService,
    OrganizationAuthService,
    OrganizationInvitesService,
  ],
})
export class OrganizationsModule {}
