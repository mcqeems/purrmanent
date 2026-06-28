import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthLogController } from './health.controller';
import { HealthCronService } from './health-cron.service';
import { CatsModule } from '../cats/cats.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [CatsModule, NotificationModule],
  controllers: [HealthLogController],
  providers: [HealthService, HealthCronService],
  exports: [HealthService],
})
export class HealthModule {}
