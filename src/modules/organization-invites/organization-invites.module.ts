import { Module } from '@nestjs/common';
import { HashingModule } from 'src/common/hashing/hashing.module';
import { QueueModule } from 'src/queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationInvitesController } from './organization-invites.controller';
import { OrganizationInvitesService } from './organization-invites.service';

@Module({
  imports: [HashingModule, QueueModule, AuthModule],
  controllers: [OrganizationInvitesController],
  providers: [OrganizationInvitesService],
})
export class OrganizationInvitesModule {}
