import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  controllers: [OrganizationController, AuthController],
  providers: [OrganizationService, AuthService]
})
export class OrganizationModule {}
