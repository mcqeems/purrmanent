import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from '../../entities';
import { ChecklistGenerationService } from './checklist-generation.service';

/**
 * Nightly daily-board reset + phase-milestone injection (spec §2.1).
 *
 * ponytail: single 00:00 Asia/Jakarta cron. Ceiling = correct only for WIB
 * users. Upgrade path = an hourly cron that resets each user whose *local*
 * clock just crossed midnight (multi-tz is optional scope, spec §2.9 / R4).
 *
 * Historical dates are never deleted (streaks/gamification read them);
 * "wipe incomplete daily" = simply not carrying yesterday's items into today.
 */
@Injectable()
export class ChecklistCronService {
  private readonly logger = new Logger(ChecklistCronService.name);

  constructor(
    @InjectRepository(Cat) private readonly cats: Repository<Cat>,
    private readonly generation: ChecklistGenerationService,
  ) {}

  @Cron('0 0 * * *', { timeZone: 'Asia/Jakarta' })
  async runDailyReset(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const activeCats = await this.cats.find({ where: { isActive: true } });
    let dailyCount = 0;
    let phaseCount = 0;
    for (const cat of activeCats) {
      dailyCount += await this.generation.generateDailyForCat(cat, today);
      phaseCount += await this.generation.injectPhaseMilestones(cat, today);
    }
    this.logger.log(
      `Daily reset: ${dailyCount} daily + ${phaseCount} phase items across ${activeCats.length} cats`,
    );
  }
}
