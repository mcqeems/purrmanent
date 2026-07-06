import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from '../../entities';
import { ChecklistGenerationService } from './checklist-generation.service';
import type { Env } from '../../config/env';

/**
 * Nightly daily-board reset + phase-milestone injection.
 *
 * Reads APP_TIMEZONE from env at boot (default: Asia/Jakarta).
 * Upgrade path = an hourly cron that resets each user whose *local*
 * clock just crossed midnight (multi-tz is optional scope).
 *
 * Historical dates are never deleted (streaks/gamification read them);
 * "wipe incomplete daily" = simply not carrying yesterday's items into today.
 */
@Injectable()
export class ChecklistCronService implements OnModuleInit {
  private readonly logger = new Logger(ChecklistCronService.name);

  constructor(
    @InjectRepository(Cat) private readonly cats: Repository<Cat>,
    private readonly generation: ChecklistGenerationService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService<Env, true>,
  ) {}

  onModuleInit() {
    const tz = this.config.get('APP_TIMEZONE', { infer: true });
    const job = new CronJob(
      '0 0 * * *',
      () => this.runDailyReset(),
      null,
      true,
      tz,
    );
    this.schedulerRegistry.addCronJob('checklist-daily-reset', job);
    this.logger.log(`Scheduled daily reset cron at 00:00 ${tz}`);
  }

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
