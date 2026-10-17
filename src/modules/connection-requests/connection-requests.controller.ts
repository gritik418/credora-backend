import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ConnectionRequestsService } from './connection-requests.service';
import SendConnectionRequestDto from './dto/send-connection-request.dto';

@Controller('connection-requests')
export class ConnectionRequestsController {
  constructor(
    private readonly connectionRequestsService: ConnectionRequestsService,
  ) {}

  @Post('send')
  async sendConnectionRequest(
    @Body() data: SendConnectionRequestDto,
    @Req() req: Request,
  ) {
    return this.connectionRequestsService.sendConnectionRequest(data, req);
  }
}
