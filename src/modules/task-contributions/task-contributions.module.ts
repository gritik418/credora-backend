import { Module } from '@nestjs/common';
import { TaskContributionsController } from './task-contributions.controller';
import { TaskContributionsService } from './task-contributions.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TaskContributionsController],
  providers: [TaskContributionsService],
})
export class TaskContributionsModule {}
