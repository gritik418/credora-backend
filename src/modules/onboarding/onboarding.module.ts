import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { AuthModule } from '../auth/auth.module';
import { SkillsModule } from '../skills/skills.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, SkillsModule, UsersModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
