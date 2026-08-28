import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [AuthModule, SkillsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
