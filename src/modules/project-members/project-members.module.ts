import { Module } from '@nestjs/common';
import { ProjectMembersController } from './project-members.controller';
import { ProjectMembersService } from './project-members.service';

@Module({
  controllers: [ProjectMembersController],
  providers: [ProjectMembersService]
})
export class ProjectMembersModule {}
