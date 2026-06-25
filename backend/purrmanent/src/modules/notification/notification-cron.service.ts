import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription } from '../../entities';
import { NotificationService } from './notification.service';

/**
 * Daily checklist reminder (spec §2.10). One push/day to each subscribed user —
 * capped to avoid spam.
 *
 * ponytail: single 08:00 Asia/Jakarta cron (same WIB ceiling as §3.6).
 */
@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subs: Repository<PushSubscription>,
    private readonly notifications: NotificationService,
  ) {}

  @Cron('0 8 * * *', { timeZone: 'Asia/Jakarta' })
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
