import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@Req() req: Request) {
    return this.notificationsService.getNotifications(req);
  }
}
