import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat, ChecklistItem, ChecklistTemplate } from '../../entities';
import {
  dayNumberFor,
  phaseForDay,
  SHY_DECOMPRESSION_DAYS,
  DEFAULT_DECOMPRESSION_DAYS,
  PHASE_THRESHOLDS,
} from '../../common/plan/plan';

/**
 * Generates checklist items from templates. Shared by the nightly cron and the
 * on-demand guard ("missing checklist items auto-generate").
 *
 * Daily templates are keyed (phase, day_in_phase=1, board='daily') — the
 * representative daily routine for a phase. Phase-milestone templates use
 * board='phase' with day_in_phase = the threshold day (3/21/90).
 *
 * Inserts use orIgnore() so re-runs are idempotent against the
 * (cat_id, scheduled_date, template_id) unique constraint.
 */
@Injectable()
export class ChecklistGenerationService {
  constructor(
    @InjectRepository(ChecklistItem)
    private readonly items: Repository<ChecklistItem>,
    @InjectRepository(ChecklistTemplate)
    private readonly templates: Repository<ChecklistTemplate>,
  ) {}

  private decompressionDays(cat: Cat): number {
    return cat.personality === 'shy'
      ? SHY_DECOMPRESSION_DAYS
      : DEFAULT_DECOMPRESSION_DAYS;
  }

  /** Generate today's daily board for a cat. Returns the number of new rows. */
  async generateDailyForCat(
    cat: Cat,
    scheduledDate: string = new Date().toISOString().slice(0, 10),
  ): Promise<number> {
    const dayNumber = dayNumberFor(cat.adoptionDate, new Date(scheduledDate));
    if (dayNumber < 1 || dayNumber > 90) return 0;

    const phase = phaseForDay(dayNumber, this.decompressionDays(cat));
    const templates = await this.templates.find({
      where: { phase, dayInPhase: 1, board: 'daily' },
      order: { orderIndex: 'ASC' },
    });
    if (templates.length === 0) return 0;

    const rows = templates.map((t) => ({
      catId: cat.id,
      dayNumber,
      scheduledDate,
      templateId: t.id,
      isCustom: false,
      board: 'daily' as const,
      kanbanStatus: 'todo' as const,
      itemText: t.itemText,
    }));
    const res = await this.items
      .createQueryBuilder()
      .insert()
      .values(rows)
      .orIgnore()
      .execute();
    return res.identifiers.filter(Boolean).length;
  }

  /**
   * Inject phase-milestone items when a cat crosses Day 3/21/90.
   * Idempotent: only inserts for the exact threshold day, orIgnore on conflict.
   */
  async injectPhaseMilestones(
    cat: Cat,
    scheduledDate: string = new Date().toISOString().slice(0, 10),
  ): Promise<number> {
    const dayNumber = dayNumberFor(cat.adoptionDate, new Date(scheduledDate));
    if (!PHASE_THRESHOLDS.includes(dayNumber as 3 | 21 | 90)) return 0;

    const phase = phaseForDay(dayNumber, this.decompressionDays(cat));
    const templates = await this.templates.find({
      where: { phase, dayInPhase: dayNumber, board: 'phase' },
      order: { orderIndex: 'ASC' },
    });
    if (templates.length === 0) return 0;

    const rows = templates.map((t) => ({
      catId: cat.id,
      dayNumber,
      scheduledDate,
      templateId: t.id,
      isCustom: false,
      board: 'phase' as const,
      kanbanStatus: 'todo' as const,
      itemText: t.itemText,
    }));
    const res = await this.items
      .createQueryBuilder()
      .insert()
      .values(rows)
      .orIgnore()
      .execute();
    return res.identifiers.filter(Boolean).length;
  }
}
