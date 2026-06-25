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
