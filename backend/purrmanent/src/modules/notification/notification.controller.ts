import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushSubscribeDto, UnsubscribeDto } from './notification.schema';
import { CurrentUser, Public } from '../auth/auth.decorators';

@Controller('push')
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Public()
  @Get('vapid-public-key')
  vapidKey() {
    return { publicKey: this.notifications.vapidPublicKey ?? null };
  }

  @Post('subscribe')
  subscribe(@CurrentUser('id') userId: number, @Body() dto: PushSubscribeDto) {
    return this.notifications.subscribe(userId, dto);
  }

  @Delete('unsubscribe')
  unsubscribe(@CurrentUser('id') userId: number, @Body() dto: UnsubscribeDto) {
    return this.notifications.unsubscribe(userId, dto.endpoint);
  }
}
