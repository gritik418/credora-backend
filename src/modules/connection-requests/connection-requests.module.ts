import { Module } from '@nestjs/common';
import { ConnectionRequestsController } from './connection-requests.controller';
import { ConnectionRequestsService } from './connection-requests.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ConnectionRequestsController],
  providers: [ConnectionRequestsService],
})
export class ConnectionRequestsModule {}
