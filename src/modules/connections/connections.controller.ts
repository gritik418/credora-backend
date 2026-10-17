import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ConnectionsService } from './connections.service';

@UseGuards(AuthGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getConnections(@Req() req: Request) {
    return this.connectionsService.getConnections(req);
  }

  @Get('discover')
  @HttpCode(HttpStatus.OK)
  getSuggestedPeople(@Req() req: Request) {
    return this.connectionsService.getSuggestedPeople(req);
  }
}
