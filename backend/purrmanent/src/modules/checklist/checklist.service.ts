import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChecklistItem } from '../../entities';
import { CatsService } from '../cats/cats.service';
import { ChecklistGenerationService } from './checklist-generation.service';
import { CustomTodoDto, MoveItemDto } from './checklist.schema';
import { dayNumberFor } from '../../common/plan/plan';
import {
  CHECKLIST_ITEM_COMPLETED,
  ChecklistItemCompletedEvent,
} from '../../common/events/events';

const POINTS_PER_ITEM = 10;

export interface CatBoardSummary {
  catId: number;
  name: string;
  todo: number;
  progress: number;
  done: number;
}

export interface GraduationStatus {
  catId: number;
  name: string;
  daysElapsed: number;
  qualifyingDays: number;
  missedDays: number;
  requiredDays: number;
  graduated: boolean;
  graduationDate?: string;
}

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(ChecklistItem)
    private readonly items: Repository<ChecklistItem>,
    private readonly cats: CatsService,
    private readonly generation: ChecklistGenerationService,
    private readonly events: EventEmitter2,
  ) {}

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** Aggregated To-Do/Progress/Done counts per cat (Global Overview, §2.1). */
  async getGlobal(userId: number): Promise<CatBoardSummary[]> {
    const cats = await this.cats.findAllForUser(userId);
    if (cats.length === 0) return [];

    const rows = await this.items
      .createQueryBuilder('ci')
      .select('ci.cat_id', 'catId')
      .addSelect('ci.kanban_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('ci.cat_id IN (:...ids)', { ids: cats.map((c) => c.id) })
      .andWhere('ci.board = :board', { board: 'daily' })
      .andWhere('ci.scheduled_date = :today', { today: this.today() })
      .groupBy('ci.cat_id')
      .addGroupBy('ci.kanban_status')
      .getRawMany<{ catId: number; status: string; count: string }>();

    const summary = new Map<number, CatBoardSummary>(
      cats.map((c) => [
        c.id,
        { catId: c.id, name: c.name, todo: 0, progress: 0, done: 0 },
      ]),
    );
    for (const r of rows) {
      const s = summary.get(Number(r.catId));
      if (
        s &&
        (r.status === 'todo' || r.status === 'progress' || r.status === 'done')
      ) {
        s[r.status] = Number(r.count);
      }
    }
    return [...summary.values()];
  }

  /**
   * Graduation: a cat graduates after 90 QUALIFYING days (counted from the day
   * it was added to the system, cat.createdAt) — a qualifying day is one whose
   * daily todos were all completed. Missed days don't count, so each missed day
   * effectively pushes the finish line out by one (the "+1/+2" rule).
   */
  async graduationStatus(userId: number): Promise<GraduationStatus[]> {
    const cats = await this.cats.findAllForUser(userId);
    if (cats.length === 0) return [];
    const today = this.today();
    const out: GraduationStatus[] = [];

    // /* ── REAL LOGIC (commented out for UI testing) ────────────────────────
    for (const cat of cats) {
      const rows = await this.items
        .createQueryBuilder('ci')
        .select('ci.scheduled_date', 'date')
        .addSelect('COUNT(*)', 'total')
        .addSelect(`COUNT(*) FILTER (WHERE ci.kanban_status = 'done')`, 'done')
        .where('ci.cat_id = :catId', { catId: cat.id })
        .andWhere(`ci.board = 'daily'`)
        .andWhere('ci.scheduled_date IS NOT NULL')
        .groupBy('ci.scheduled_date')
        .getRawMany<{ date: string; total: string; done: string }>();

      let qualifyingDays = 0;
      let missedDays = 0;
      const qualifyingDates: string[] = [];
      for (const r of rows) {
        const total = Number(r.total);
        const done = Number(r.done);
        if (total > 0 && done === total) {
          qualifyingDays += 1;
          qualifyingDates.push(r.date);
        } else if (r.date < today) {
          missedDays += 1; // a past day left incomplete
        }
      }

      const created = new Date(cat.createdAt);
      const daysElapsed = Math.max(
        Math.floor((Date.now() - created.getTime()) / 86_400_000) + 1,
        1,
      );

      qualifyingDates.sort();
      const graduated = qualifyingDays >= 90;
      const graduationDate =
        graduated && qualifyingDates.length >= 90
          ? qualifyingDates[89]
          : undefined;

      out.push({
        catId: cat.id,
        name: cat.name,
        daysElapsed,
        qualifyingDays,
        missedDays,
        requiredDays: 90,
        graduated,
        graduationDate,
      });
    }
    return out;
    // ── END REAL LOGIC ──────────────────────────────────────────────────── */

    // ── DUMMY: all cats immediately graduated (for UI testing) ─────────
    // return cats.map((cat) => {
    //   const created = new Date(cat.createdAt);
    //   const gradDate = new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000);
    //   return {
    //     catId: cat.id,
    //     name: cat.name,
    //     daysElapsed: 90,
    //     qualifyingDays: 90,
    //     missedDays: 0,
    //     requiredDays: 90,
    //     graduated: true,
    //     graduationDate: gradDate.toISOString().slice(0, 10),
    //   };
    // });
    // ── END DUMMY ──────────────────────────────────────────────────────
  }

  /** Daily board for a cat; generates on-demand if today's set is missing. */
  async getToday(userId: number, catId: number): Promise<ChecklistItem[]> {
    const cat = await this.cats.findOneForUser(userId, catId);
    const today = this.today();
    let rows = await this.items.find({
      where: { catId: cat.id, board: 'daily', scheduledDate: today },
      order: { id: 'ASC' },
    });
    if (rows.length === 0) {
      await this.generation.generateDailyForCat(cat, today);
      rows = await this.items.find({
        where: { catId: cat.id, board: 'daily', scheduledDate: today },
        order: { id: 'ASC' },
      });
    }
    return rows;
  }

  /** 90-day phase milestone board for a cat. */
  async getPhase(userId: number, catId: number): Promise<ChecklistItem[]> {
    const cat = await this.cats.findOneForUser(userId, catId);
    return this.items.find({
      where: { catId: cat.id, board: 'phase' },
      order: { dayNumber: 'ASC', id: 'ASC' },
    });
  }

  async addCustom(userId: number, dto: CustomTodoDto): Promise<ChecklistItem> {
    const cat = await this.cats.findOneForUser(userId, dto.catId);
    const today = this.today();
    const item = this.items.create({
      catId: cat.id,
      dayNumber: dayNumberFor(cat.adoptionDate),
      scheduledDate: today,
      templateId: null, // NULL => not constrained by the unique index
      isCustom: true,
      board: dto.board,
      kanbanStatus: 'todo',
      itemText: dto.itemText,
    });
    return this.items.save(item);
  }

  /**
   * Idempotent points (plan §3.7): award +10 only on the FIRST transition into
   * 'done', detected atomically with `completed_at IS NULL`. Moving back out of
   * done clears completed_at but awards nothing.
   */
  async move(
    userId: number,
    dto: MoveItemDto,
  ): Promise<{ success: true; pointsAdded: number }> {
    const item = await this.items.findOne({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Checklist item not found');
    // ownership (throws if the cat is not the user's)
    await this.cats.findOneForUser(userId, item.catId);

    if (dto.newStatus === 'done') {
      const res = await this.items
        .createQueryBuilder()
        .update(ChecklistItem)
        .set({ kanbanStatus: 'done', completedAt: () => 'now()' })
        .where('id = :id AND completed_at IS NULL', { id: dto.itemId })
        .execute();

      if (res.affected && res.affected > 0) {
        const payload: ChecklistItemCompletedEvent = {
          userId,
          catId: item.catId,
          itemId: item.id,
          points: POINTS_PER_ITEM,
        };
        this.events.emit(CHECKLIST_ITEM_COMPLETED, payload);
        return { success: true, pointsAdded: POINTS_PER_ITEM };
      }
      // already done — no double award
      return { success: true, pointsAdded: 0 };
    }

    // moving to todo/progress: clear completion, award nothing
    await this.items.update(dto.itemId, {
      kanbanStatus: dto.newStatus,
      completedAt: null,
    });
    return { success: true, pointsAdded: 0 };
  }
}
