import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CatsService } from '../cats/cats.service';
import {
  createCatSchema,
  updateCatSchema,
  CreateCatDto,
} from '../cats/cat.schema';
import { ChecklistService } from '../checklist/checklist.service';
import {
  customTodoSchema,
  moveItemSchema,
} from '../checklist/checklist.schema';
import { HealthService } from '../health/health.service';
import {
  createHealthRecordSchema,
  updateHealthRecordSchema,
} from '../health/health.schema';
import { GamificationService } from '../gamification/gamification.service';
import { CrisisService } from '../crisis/crisis.service';
import { crisisStepSchema, resolveCrisisSchema } from '../crisis/crisis.schema';
import type { LlmTool } from '../../common/llm/llm.service';

/**
 * One agent-callable action. The Zod `schema` is BOTH the model-facing
 * parameter contract (via JSON Schema) and the server-side validation gate.
 * `mutates` decides control flow: read actions run inline during a turn, write
 * actions are confirmed by the user before they ever execute.
 *
 * Security (anti-IDOR): `handler` receives `userId` from the authenticated
 * request — NEVER from the model or client. Tool schemas never contain
 * `userId`, and the underlying services re-check ownership, so a tool call
 * cannot read or mutate another user's data.
 */
export interface CoachAction {
  name: string;
  description: string;
  schema: z.ZodType;
  mutates: boolean;
  handler: (userId: number, args: unknown) => Promise<unknown>;
}

export interface ActionResult {
  ok: boolean;
  action: string;
  result?: unknown;
  error?: string;
}

/** Strip the `$schema` key zod emits — OpenAI wants a bare parameters object. */
function toToolParameters(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

// Small id-only argument schemas for actions that target an existing entity.
const catIdSchema = z.object({ catId: z.number().int().positive() });
const recordIdSchema = z.object({ recordId: z.number().int().positive() });

@Injectable()
export class CoachActionsService {
  private readonly actions: Map<string, CoachAction>;

  constructor(
    private readonly cats: CatsService,
    private readonly checklist: ChecklistService,
    private readonly health: HealthService,
    private readonly gamification: GamificationService,
    private readonly crisis: CrisisService,
  ) {
    const list: CoachAction[] = [
      // ── Reads (run inline) ──────────────────────────────────────────────
      {
        name: 'list_cats',
        description: 'List the cats belonging to the current user.',
        schema: z.object({}),
        mutates: false,
        handler: (userId) => this.cats.findAllForUser(userId),
      },
      {
        name: 'get_cat_details',
        description: "Get one of the current user's cats by its id.",
        schema: catIdSchema,
        mutates: false,
        handler: (userId, args) =>
          this.cats.findOneForUser(userId, (args as { catId: number }).catId),
      },
      {
        name: 'get_todays_checklist',
        description:
          "Get today's daily care checklist board for one of the user's cats.",
        schema: catIdSchema,
        mutates: false,
        handler: (userId, args) =>
          this.checklist.getToday(userId, (args as { catId: number }).catId),
      },
      {
        name: 'get_checklist_phase',
        description:
          "Get the 90-day phase-milestone board for one of the user's cats.",
        schema: catIdSchema,
        mutates: false,
        handler: (userId, args) =>
          this.checklist.getPhase(userId, (args as { catId: number }).catId),
      },
      {
        name: 'get_checklist_overview',
        description:
          "Get To-Do / In-Progress / Done counts across all of the user's cats.",
        schema: z.object({}),
        mutates: false,
        handler: (userId) => this.checklist.getGlobal(userId),
      },
      {
        name: 'get_health_timeline',
        description:
          'Get the reverse-chronological health record timeline for a cat.',
        schema: catIdSchema,
        mutates: false,
        handler: (userId, args) =>
          this.health.timeline(userId, (args as { catId: number }).catId),
      },
      {
        name: 'get_upcoming_reminders',
        description:
          'List upcoming due health reminders (vaccinations, vet visits, etc.) ' +
          "across the user's cats, within an optional number of days (default 30).",
        schema: z.object({
          withinDays: z.number().int().min(1).max(365).optional(),
        }),
        mutates: false,
        handler: (userId, args) =>
          this.health.upcomingForUser(
            userId,
            (args as { withinDays?: number }).withinDays,
          ),
      },
      {
        name: 'get_progress_status',
        description: "Get the user's gamification status (points balance).",
        schema: z.object({}),
        mutates: false,
        handler: (userId) => this.gamification.getStatus(userId),
      },
      {
        name: 'get_crisis_protocol',
        description:
          'Get the slide dataset for a specific crisis scenario by its id.',
        schema: z.object({ scenarioId: z.number().int().positive() }),
        mutates: false,
        handler: (_userId, args) =>
          this.crisis.getProtocol((args as { scenarioId: number }).scenarioId),
      },

      // ── Writes (confirmed before execution) ─────────────────────────────
      {
        name: 'add_cat',
        description:
          "Add a new cat to the current user's account. Ask the user for every " +
          'required field you are missing (name, personality, adoption date, ' +
          'adoption source) BEFORE calling this — do not invent values.',
        schema: createCatSchema,
        mutates: true,
        handler: (userId, args) =>
          this.cats.create(userId, args as CreateCatDto),
      },
      {
        name: 'update_cat',
        description:
          "Update fields of one of the user's existing cats. Provide catId and " +
          'only the fields to change.',
        schema: updateCatSchema.extend({
          catId: z.number().int().positive(),
        }),
        mutates: true,
        handler: (userId, args) => {
          const { catId, ...rest } = args as { catId: number };
          return this.cats.update(userId, catId, rest);
        },
      },
      {
        name: 'add_health_record',
        description:
          'Add a health record (vaccination, deworming, vet_visit, weight, or ' +
          'note) for a cat. recordData fields depend on the type (e.g. ' +
          'vaccineName for vaccination, weightGrams for weight, text for note).',
        schema: createHealthRecordSchema,
        mutates: true,
        handler: (userId, args) =>
          this.health.create(
            userId,
            args as Parameters<HealthService['create']>[1],
          ),
      },
      {
        name: 'update_health_record',
        description:
          'Update an existing health record by its recordId (recordData, ' +
          'recordedAt, or nextDueDate).',
        schema: updateHealthRecordSchema.extend({
          recordId: z.number().int().positive(),
        }),
        mutates: true,
        handler: (userId, args) => {
          const { recordId, ...rest } = args as { recordId: number };
          return this.health.update(userId, recordId, rest);
        },
      },
      {
        name: 'remove_health_record',
        description: 'Delete a health record by its recordId.',
        schema: recordIdSchema,
        mutates: true,
        handler: (userId, args) =>
          this.health.remove(userId, (args as { recordId: number }).recordId),
      },
      {
        name: 'add_checklist_item',
        description:
          'Add a custom checklist to-do item for a cat (board: daily or phase).',
        schema: customTodoSchema,
        mutates: true,
        handler: (userId, args) =>
          this.checklist.addCustom(
            userId,
            args as Parameters<ChecklistService['addCustom']>[1],
          ),
      },
      {
        name: 'move_checklist_item',
        description:
          'Move a checklist item to a new Kanban status (todo, progress, done).',
        schema: moveItemSchema,
        mutates: true,
        handler: (userId, args) =>
          this.checklist.move(
            userId,
            args as Parameters<ChecklistService['move']>[1],
          ),
      },
      {
        name: 'log_crisis_step',
        description:
          'Mark a step of an active crisis event as completed (by eventId and ' +
          'stepIndex).',
        schema: crisisStepSchema,
        mutates: true,
        handler: (userId, args) =>
          this.crisis.step(
            userId,
            args as Parameters<CrisisService['step']>[1],
          ),
      },
      {
        name: 'resolve_crisis',
        description:
          'Resolve an active crisis event (eventId, whether it is done, and an ' +
          'optional reason if not).',
        schema: resolveCrisisSchema,
        mutates: true,
        handler: (userId, args) =>
          this.crisis.resolve(
            userId,
            args as Parameters<CrisisService['resolve']>[1],
          ),
      },
    ];
    this.actions = new Map(list.map((a) => [a.name, a]));
  }

  /** OpenAI tool definitions generated from the registered Zod schemas. */
  tools(): LlmTool[] {
    return [...this.actions.values()].map((a) => ({
      type: 'function',
      function: {
        name: a.name,
        description: a.description,
        parameters: toToolParameters(a.schema),
      },
    }));
  }

  isMutating(name: string): boolean {
    return this.actions.get(name)?.mutates ?? false;
  }

  /**
   * Validate raw (model- or client-supplied) args against the action's schema,
   * then run its handler scoped to the authenticated `userId`. All args are
   * treated as untrusted input. Never throws — returns a structured result the
   * agent can feed back to the model or the controller can return as JSON.
   */
  async execute(
    name: string,
    userId: number,
    rawArgs: unknown,
  ): Promise<ActionResult> {
    const action = this.actions.get(name);
    if (!action) {
      return { ok: false, action: name, error: `Unknown action: ${name}` };
    }
    const parsed = action.schema.safeParse(rawArgs ?? {});
    if (!parsed.success) {
      return {
        ok: false,
        action: name,
        error: parsed.error.issues
          .map((i) => `${i.path.join('.')} ${i.message}`)
          .join('; '),
      };
    }
    try {
      const result = await action.handler(userId, parsed.data);
      return { ok: true, action: name, result };
    } catch (err) {
      return { ok: false, action: name, error: String(err) };
    }
  }
}
