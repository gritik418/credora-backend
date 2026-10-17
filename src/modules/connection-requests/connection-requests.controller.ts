import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ConnectionRequestsService } from './connection-requests.service';
import SendConnectionRequestDto from './dto/send-connection-request.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('connection-requests')
export class ConnectionRequestsController {
  constructor(
    private readonly connectionRequestsService: ConnectionRequestsService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendConnectionRequest(
    @Body() data: SendConnectionRequestDto,
    @Req() req: Request,
  ) {
    return this.connectionRequestsService.sendConnectionRequest(data, req);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getConnectionRequests(@Req() req: Request) {
    return this.connectionRequestsService.getConnectionRequests(req);
  }
}
