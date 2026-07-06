/** Event contracts shared between emitters (checklist/crisis) and the
 * gamification listener. Points are awarded once per genuine completion — the
 * emitter guarantees single emission, so listeners stay dumb. */

export const CHECKLIST_ITEM_COMPLETED = 'checklist.item.completed';
export const CRISIS_STEP_COMPLETED = 'crisis.step.completed';

export interface ChecklistItemCompletedEvent {
  userId: number;
  catId: number;
  itemId: number;
  points: number;
}

export interface CrisisStepCompletedEvent {
  userId: number;
  catId: number;
  eventId: number;
  stepIndex: number;
  points: number;
}
