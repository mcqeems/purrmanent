import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import {
  CHECKLIST_ITEM_COMPLETED,
  CRISIS_STEP_COMPLETED,
} from '../../common/events/events';
import type {
  ChecklistItemCompletedEvent,
  CrisisStepCompletedEvent,
} from '../../common/events/events';

/**
 * Thin, event-driven points balance. The emitters guarantee
 * once-only emission per genuine completion, so this listener stays
 * dumb — no dedup logic. The increment is atomic at the DB (race-safe).
 */
@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  private award(userId: number, points: number): Promise<unknown> {
    return this.users.increment({ id: userId }, 'points', points);
  }

  @OnEvent(CHECKLIST_ITEM_COMPLETED)
  async onChecklistCompleted(e: ChecklistItemCompletedEvent): Promise<void> {
    await this.award(e.userId, e.points);
  }

  @OnEvent(CRISIS_STEP_COMPLETED)
  async onCrisisStepCompleted(e: CrisisStepCompletedEvent): Promise<void> {
    await this.award(e.userId, e.points);
  }

  async getStatus(userId: number): Promise<{ points: number; streak: number }> {
    const user = await this.users.findOne({
      where: { id: userId },
      select: {
        id: true,
        points: true,
        loginStreak: true,
        lastActiveDate: true,
      },
    });
    if (!user) return { points: 0, streak: 0 };

    // Read-only: return current streak without updating.
    // To update the streak, the client must explicitly POST to /gamification/check-in.
    return { points: user.points ?? 0, streak: user.loginStreak ?? 0 };
  }

  async checkIn(userId: number): Promise<{ points: number; streak: number }> {
    const user = await this.users.findOne({
      where: { id: userId },
      select: {
        id: true,
        points: true,
        loginStreak: true,
        lastActiveDate: true,
      },
    });
    if (!user) return { points: 0, streak: 0 };

    // Update the login streak once per (server) day on explicit check-in.
    // ponytail ceiling: uses server-local date, not the user's timezone.
    const today = new Date().toISOString().slice(0, 10);
    let streak = user.loginStreak ?? 0;
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86_400_000)
        .toISOString()
        .slice(0, 10);
      streak = user.lastActiveDate === yesterday ? streak + 1 : 1;
      await this.users.update(user.id, {
        loginStreak: streak,
        lastActiveDate: today,
      });
    }
    return { points: user.points ?? 0, streak };
  }
}
