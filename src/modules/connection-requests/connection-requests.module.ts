import { Module } from '@nestjs/common';
import { ConnectionRequestsController } from './connection-requests.controller';
import { ConnectionRequestsService } from './connection-requests.service';

@Module({
  controllers: [ConnectionRequestsController],
  providers: [ConnectionRequestsService]
})
export class ConnectionRequestsModule {}
