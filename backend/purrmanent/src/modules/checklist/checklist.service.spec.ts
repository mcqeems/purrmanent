import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChecklistService } from './checklist.service';
import { CHECKLIST_ITEM_COMPLETED } from '../../common/events/events';

/**
 * Idempotency check (plan §3.7 / §4): two consecutive moves to 'done' award
 * points exactly once. The atomic `completed_at IS NULL` guard is simulated by
 * the conditional UPDATE returning affected=1 the first time, 0 the second.
 */
describe('ChecklistService.move (points idempotency)', () => {
  function setup(affectedSequence: number[]) {
    let call = 0;
    const qb = {
      update: () => qb,
      set: () => qb,
      where: () => qb,
      execute: () => Promise.resolve({ affected: affectedSequence[call++] }),
    };
    const items = {
      findOne: () =>
        Promise.resolve({ id: 1, catId: 7, kanbanStatus: 'progress' }),
      createQueryBuilder: () => qb,
      update: jest.fn(() => Promise.resolve({ affected: 1 })),
    };
    const cats = { findOneForUser: () => Promise.resolve({ id: 7 }) };
    const emitter = new EventEmitter2();
    const emit = jest.spyOn(emitter, 'emit');
    const service = new ChecklistService(
      items as never,
      cats as never,
      {} as never,
      emitter,
    );
    return { service, emit, items };
  }

  it('awards points only on the first transition into done', async () => {
    const { service, emit } = setup([1, 0]);

    const first = await service.move(1, { itemId: 1, newStatus: 'done' });
    expect(first.pointsAdded).toBe(10);
    expect(emit).toHaveBeenCalledWith(
      CHECKLIST_ITEM_COMPLETED,
      expect.objectContaining({ itemId: 1, catId: 7, points: 10 }),
    );

    const second = await service.move(1, { itemId: 1, newStatus: 'done' });
    expect(second.pointsAdded).toBe(0);
    expect(emit).toHaveBeenCalledTimes(1); // still only one award
  });

  it('awards nothing when moving out of done', async () => {
    const { service, emit, items } = setup([]);
    const res = await service.move(1, { itemId: 1, newStatus: 'todo' });
    expect(res.pointsAdded).toBe(0);
    expect(emit).not.toHaveBeenCalled();
    expect(items.update).toHaveBeenCalledWith(1, {
      kanbanStatus: 'todo',
      completedAt: null,
    });
  });
});
