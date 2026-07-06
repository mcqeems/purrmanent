import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription } from '../../entities';
import { NotificationService } from './notification.service';
import type { Env } from '../../config/env';

/**
 * Daily checklist reminder. One push/day to each subscribed user —
 * capped to avoid spam.
 *
 * Reads APP_TIMEZONE from env at boot (default: Asia/Jakarta).
 */
@Injectable()
export class NotificationCronService implements OnModuleInit {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subs: Repository<PushSubscription>,
    private readonly notifications: NotificationService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService<Env, true>,
  ) {}

  onModuleInit() {
    const tz = this.config.get('APP_TIMEZONE', { infer: true });
    const job = new CronJob(
      '0 8 * * *',
      () => this.sendDailyReminders(),
      null,
      true,
      tz,
    );
    this.schedulerRegistry.addCronJob('notification-daily-reminder', job);
    this.logger.log(`Scheduled daily reminder cron at 08:00 ${tz}`);
  }

  async sendDailyReminders(): Promise<void> {
    const rows = await this.subs
      .createQueryBuilder('s')
      .select('DISTINCT s.user_id', 'userId')
      .getRawMany<{ userId: number }>();

    let sent = 0;
    for (const { userId } of rows) {
      sent += await this.notifications.send(
        Number(userId),
        {
          title: 'Purrmanent 🐾',
          body: "Today's cat care checklist is ready. Tap to check in!",
          url: '/dashboard/check',
        },
        'daily_reminder',
      );
    }
    this.logger.log(`Daily reminders delivered: ${sent}`);
  }
}
