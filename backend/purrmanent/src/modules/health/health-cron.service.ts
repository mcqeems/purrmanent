import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HealthService } from './health.service';
import { NotificationService } from '../notification/notification.service';

/**
 * Health due-date reminders (spec §2.5): notify 3 days before and on the due
 * date. Reuses NotificationService.send (plan §8/§9).
 *
 * ponytail: single 08:00 Asia/Jakarta cron (WIB ceiling per §3.6).
 */
@Injectable()
export class HealthCronService {
  private readonly logger = new Logger(HealthCronService.name);

  constructor(
    private readonly health: HealthService,
    private readonly notifications: NotificationService,
  ) {}

  @Cron('0 8 * * *', { timeZone: 'Asia/Jakarta' })
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
    this.logger.log(`Health due reminders: ${due.length} due, ${sent} delivered`);
  }
}
