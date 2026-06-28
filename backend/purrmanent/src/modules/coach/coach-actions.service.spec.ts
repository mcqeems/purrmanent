import { CoachActionsService } from './coach-actions.service';
import type { CatsService } from '../cats/cats.service';
import type { ChecklistService } from '../checklist/checklist.service';
import type { HealthService } from '../health/health.service';
import type { GamificationService } from '../gamification/gamification.service';
import type { CrisisService } from '../crisis/crisis.service';

// Minimal service stubs — we assert how the registry calls them.
function makeDeps() {
  const cats = {
    findAllForUser: jest.fn().mockResolvedValue([{ id: 1, name: 'Mochi' }]),
    findOneForUser: jest.fn().mockResolvedValue({ id: 1, name: 'Mochi' }),
    create: jest.fn((userId: number, dto: Record<string, unknown>) =>
      Promise.resolve({ id: 99, userId, ...dto }),
    ),
    update: jest.fn(
      (userId: number, id: number, dto: Record<string, unknown>) =>
        Promise.resolve({ id, userId, ...dto }),
    ),
  };
  const checklist = {
    getToday: jest.fn().mockResolvedValue([]),
    getPhase: jest.fn().mockResolvedValue([]),
    getGlobal: jest.fn().mockResolvedValue([]),
    addCustom: jest.fn().mockResolvedValue({ id: 5 }),
    move: jest.fn().mockResolvedValue({ success: true, pointsAdded: 10 }),
  };
  const health = {
    timeline: jest.fn().mockResolvedValue([]),
    upcomingForUser: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 7 }),
    update: jest.fn().mockResolvedValue({ id: 7 }),
    remove: jest.fn().mockResolvedValue({ success: true }),
  };
  const gamification = {
    getStatus: jest.fn().mockResolvedValue({ points: 0 }),
  };
  const crisis = {
    getProtocol: jest.fn().mockResolvedValue({ scenarioKey: 'x', slides: [] }),
    step: jest.fn().mockResolvedValue({ stepsCompleted: [0] }),
    resolve: jest.fn().mockResolvedValue({ id: 1 }),
  };
  return { cats, checklist, health, gamification, crisis };
}

function makeService(deps = makeDeps()) {
  const service = new CoachActionsService(
    deps.cats as unknown as CatsService,
    deps.checklist as unknown as ChecklistService,
    deps.health as unknown as HealthService,
    deps.gamification as unknown as GamificationService,
    deps.crisis as unknown as CrisisService,
  );
  return { service, ...deps };
}

const VALID_CAT = {
  name: 'Mochi',
  personality: 'balanced',
  adoptionDate: '2026-06-01',
  adoptionSource: 'self',
};

function fnNames(service: CoachActionsService): string[] {
  return service
    .tools()
    .flatMap((t) => (t.type === 'function' ? [t.function.name] : []))
    .sort();
}

describe('CoachActionsService.tools', () => {
  it('exposes the full read + write action set with valid JSON-schema params', () => {
    const { service } = makeService();
    const names = fnNames(service);
    expect(names).toEqual(
      [
        'add_cat',
        'add_checklist_item',
        'add_health_record',
        'get_cat_details',
        'get_checklist_overview',
        'get_checklist_phase',
        'get_health_timeline',
        'get_progress_status',
        'get_crisis_protocol',
        'get_todays_checklist',
        'get_upcoming_reminders',
        'list_cats',
        'log_crisis_step',
        'move_checklist_item',
        'remove_health_record',
        'resolve_crisis',
        'update_cat',
        'update_health_record',
      ].sort(),
    );
    // no $schema leaks into any tool's parameters
    for (const t of service.tools()) {
      if (t.type === 'function') {
        expect(
          (t.function.parameters as Record<string, unknown>).$schema,
        ).toBeUndefined();
      }
    }
  });

  it('classifies reads vs writes correctly', () => {
    const { service } = makeService();
    expect(service.isMutating('list_cats')).toBe(false);
    expect(service.isMutating('get_health_timeline')).toBe(false);
    expect(service.isMutating('add_cat')).toBe(true);
    expect(service.isMutating('remove_health_record')).toBe(true);
    expect(service.isMutating('nope')).toBe(false);
  });
});

describe('CoachActionsService.execute', () => {
  it('runs a read action scoped to the caller userId', async () => {
    const { service, cats } = makeService();
    const res = await service.execute('list_cats', 7, {});
    expect(cats.findAllForUser).toHaveBeenCalledWith(7);
    expect(res.ok).toBe(true);
  });

  it('routes an id-only read to the right service with userId + id', async () => {
    const { service, health } = makeService();
    const res = await service.execute('get_health_timeline', 7, { catId: 3 });
    expect(health.timeline).toHaveBeenCalledWith(7, 3);
    expect(res.ok).toBe(true);
  });

  it('splits catId out of update_cat and forwards the rest', async () => {
    const { service, cats } = makeService();
    await service.execute('update_cat', 7, { catId: 3, name: 'Bobby' });
    expect(cats.update).toHaveBeenCalledWith(7, 3, { name: 'Bobby' });
  });

  it('validates and runs a write action', async () => {
    const { service, cats } = makeService();
    const res = await service.execute('add_cat', 7, VALID_CAT);
    expect(res.ok).toBe(true);
    expect(cats.create).toHaveBeenCalledWith(
      7,
      expect.objectContaining(VALID_CAT),
    );
  });

  it('rejects invalid args with a structured error, never calling the handler', async () => {
    const { service, cats } = makeService();
    const res = await service.execute('add_cat', 7, { name: '' });
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
    expect(cats.create).not.toHaveBeenCalled();
  });

  it('rejects an unknown action', async () => {
    const { service } = makeService();
    const res = await service.execute('drop_table', 7, {});
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Unknown action/);
  });

  // The security guarantee: userId comes from the caller, never the args.
  it('ignores a userId smuggled in args and uses the authenticated userId (anti-IDOR)', async () => {
    const { service, cats } = makeService();
    await service.execute('add_cat', 7, { ...VALID_CAT, userId: 999 });
    const [calledUserId, payload] = cats.create.mock.calls[0];
    expect(calledUserId).toBe(7); // session user, not 999
    expect(payload).not.toHaveProperty('userId'); // stripped by the schema
  });
});
