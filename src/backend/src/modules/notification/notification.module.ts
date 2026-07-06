import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationCronService } from './notification-cron.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationCronService],
  exports: [NotificationService],
})
export class NotificationModule {}
