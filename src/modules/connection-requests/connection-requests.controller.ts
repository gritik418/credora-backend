import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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

  @Get('sent')
  @HttpCode(HttpStatus.OK)
  async getSentConnectionRequests(@Req() req: Request) {
    return this.connectionRequestsService.getSentConnectionRequests(req);
  }

  @Patch(':requestId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptConnectionRequest(
    @Param('requestId') requestId: string,
    @Req() req: Request,
  ) {
    return this.connectionRequestsService.acceptConnectionRequest(
      requestId,
      req,
    );
  }

  @Patch(':requestId/reject')
  @HttpCode(HttpStatus.OK)
  async rejectConnectionRequest(
    @Param('requestId') requestId: string,
    @Req() req: Request,
  ) {
    return this.connectionRequestsService.rejectConnectionRequest(
      requestId,
      req,
    );
  }
}
