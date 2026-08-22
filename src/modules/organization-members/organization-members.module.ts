import { Module } from '@nestjs/common';
import { OrganizationMembersController } from './organization-members.controller';
import { OrganizationMembersService } from './organization-members.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationMembersController],
  providers: [OrganizationMembersService],
})
export class OrganizationMembersModule {}
