import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HashingModule } from './common/hashing/hashing.module';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationInvitesModule } from './modules/organization-invites/organization-invites.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { QueueModule } from './queue/queue.module';
import { OrganizationMembersModule } from './modules/organization-members/organization-members.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WorkspaceMembersModule } from './modules/workspace-members/workspace-members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ProjectMembersModule } from './modules/project-members/project-members.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: Number(config.get<number>('REDIS_PORT')),
        },
      }),
    }),
    PrismaModule,
    HashingModule,
    QueueModule,
    AuthModule,
    OrganizationsModule,
    OrganizationInvitesModule,
    OrganizationMembersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    ProjectsModule,
    ProjectMembersModule,
    TasksModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
