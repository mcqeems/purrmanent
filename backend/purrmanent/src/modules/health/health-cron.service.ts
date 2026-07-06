import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';
import { NotificationService } from '../notification/notification.service';
import type { Env } from '../../config/env';

/**
 * Health due-date reminders (spec §2.5): notify 3 days before and on the due
 * date. Reuses NotificationService.send (plan §8/§9).
 *
 * Reads APP_TIMEZONE from env at boot (default: Asia/Jakarta).
 */
@Injectable()
export class HealthCronService implements OnModuleInit {
  private readonly logger = new Logger(HealthCronService.name);

  constructor(
    private readonly health: HealthService,
    private readonly notifications: NotificationService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService<Env, true>,
  ) {}

  onModuleInit() {
    const tz = this.config.get('APP_TIMEZONE', { infer: true });
    const job = new CronJob(
      '0 8 * * *',
      () => this.sendDueReminders(),
      null,
      true,
      tz,
    );
    this.schedulerRegistry.addCronJob('health-due-reminders', job);
    this.logger.log(`Scheduled health reminders cron at 08:00 ${tz}`);
  }

  async sendDueReminders(): Promise<void> {
    const today = new Date();
    const from = today.toISOString().slice(0, 10);
    const to = new Date(today.getTime() + 3 * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const due = await this.health.findDue(from, to);
    let sent = 0;
    for (const rec of due) {
      sent += await this.notifications.send(
        rec.userId,
        {
          title: `Health reminder for ${rec.catName} 🐾`,
          body: `${rec.recordType.replace('_', ' ')} is due on ${rec.nextDueDate}.`,
          url: '/dashboard/health',
        },
        'health_due',
      );
    }
    this.logger.log(
      `Health due reminders: ${due.length} due, ${sent} delivered`,
    );
  }
}
