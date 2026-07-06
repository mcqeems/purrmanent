import { AppDataSource } from '../database/data-source';
import {
  Cat,
  ChecklistItem,
  ChecklistTemplate,
  CrisisScenario,
  User,
} from '../entities';
import { PROTOCOLS, loadProtocolSlides } from '../modules/crisis/protocols';
import { dayNumberFor, phaseForDay } from '../common/plan/plan';

/**
 * Idempotent seeder. Seeds BOTH:
 *   1. Reference data — checklist_templates + crisis_scenarios — required at
 *      runtime by onboarding, the daily cron, and Crisis Mode.
 *   2. Demo data — 1 shelter (codes), 1 demo user, 3 cats at different phases
 *      with a partially-completed checklist backfill.
 *
 * Re-running must not duplicate rows (upsert / orIgnore on natural keys).
 */

interface TemplateSeed {
  phase: string;
  dayInPhase: number;
  timeOfDay: string;
  category: string;
  board: string;
  itemText: string;
  orderIndex: number;
}

const DAILY_TEMPLATES: TemplateSeed[] = [
  // decompression daily
  ...[
    'Refill fresh water and clean the bowl',
    'Offer food in a quiet, low-traffic spot',
    'Scoop and check the litter box',
    'Sit calmly near the safe room without forcing contact',
  ].map((itemText, i) => ({
    phase: 'decompression',
    dayInPhase: 1,
    timeOfDay: 'day',
    category: i === 2 ? 'health' : i === 3 ? 'interaction' : 'environment',
    board: 'daily',
    itemText,
    orderIndex: i,
  })),
  // routine daily
  ...[
    'Morning feeding',
    '10-minute interactive play session',
    'Brush / groom your cat',
    'Evening feeding and litter check',
  ].map((itemText, i) => ({
    phase: 'routine',
    dayInPhase: 1,
    timeOfDay: i < 2 ? 'morning' : 'evening',
    category: i === 1 ? 'mental' : 'health',
    board: 'daily',
    itemText,
    orderIndex: i,
  })),
  // home daily
  ...[
    'Feeding and fresh water',
    'Play and enrichment',
    'Quick body & litter check',
  ].map((itemText, i) => ({
    phase: 'home',
    dayInPhase: 1,
    timeOfDay: 'day',
    category: i === 1 ? 'mental' : 'health',
    board: 'daily',
    itemText,
    orderIndex: i,
  })),
];

const PHASE_TEMPLATES: TemplateSeed[] = [
  {
    phase: 'decompression',
    dayInPhase: 3,
    timeOfDay: 'day',
    category: 'interaction',
    board: 'phase',
    itemText:
      'Day 3: Cat is starting to settle — note first signs of curiosity',
    orderIndex: 0,
  },
  {
    phase: 'routine',
    dayInPhase: 21,
    timeOfDay: 'day',
    category: 'interaction',
    board: 'phase',
    itemText:
      'Day 21: Routine established — celebrate a calmer, more confident cat',
    orderIndex: 0,
  },
  {
    phase: 'home',
    dayInPhase: 90,
    timeOfDay: 'day',
    category: 'interaction',
    board: 'phase',
    itemText: 'Day 90: Graduation! Your cat is fully at home 🎓',
    orderIndex: 0,
  },
];

const DEMO_EMAIL = 'demo@purrmanent.app';

function dateDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

async function seedTemplates(): Promise<void> {
  const repo = AppDataSource.getRepository(ChecklistTemplate);
  const all = [...DAILY_TEMPLATES, ...PHASE_TEMPLATES];
  await repo.createQueryBuilder().insert().values(all).orIgnore().execute();
  console.log(`Templates ensured: ${all.length}`);
}

async function seedScenarios(): Promise<void> {
  const repo = AppDataSource.getRepository(CrisisScenario);
  for (const p of PROTOCOLS) {
    const slides = loadProtocolSlides(p.file);
    await repo
      .createQueryBuilder()
      .insert()
      .values({
        scenarioKey: p.scenarioKey,
        name: p.name,
        icon: p.icon,
        severity: p.severity,
        protocolData: { slides },
      })
      .orUpdate(['name', 'icon', 'severity', 'protocol_data'], ['scenario_key'])
      .execute();
  }
  console.log(`Crisis scenarios ensured: ${PROTOCOLS.length}`);
}

async function seedDemoUserAndCats(): Promise<void> {
  const users = AppDataSource.getRepository(User);
  const cats = AppDataSource.getRepository(Cat);
  const items = AppDataSource.getRepository(ChecklistItem);
  const templates = AppDataSource.getRepository(ChecklistTemplate);

  let user = await users.findOne({ where: { email: DEMO_EMAIL } });
  if (!user) {
    user = await users.save(
      users.create({
        email: DEMO_EMAIL,
        name: 'Demo Adopter',
        emailVerified: true,
        timezone: 'Asia/Jakarta',
        preferredLanguage: 'en',
      }),
    );
  }

  const demoCats = [
    {
      name: 'Luna',
      personality: 'shy',
      daysAgo: 1,
      shelterCode: 'SHELTER-JKT-001',
    },
    {
      name: 'Mochi',
      personality: 'balanced',
      daysAgo: 13,
      shelterCode: 'SHELTER-JKT-002',
    },
    {
      name: 'Bella',
      personality: 'active',
      daysAgo: 44,
      shelterCode: 'SHELTER-JKT-003',
    },
  ];

  for (const dc of demoCats) {
    let cat = await cats.findOne({
      where: { userId: user.id, shelterCode: dc.shelterCode },
    });
    if (!cat) {
      cat = await cats.save(
        cats.create({
          userId: user.id,
          name: dc.name,
          personality: dc.personality,
          adoptionDate: dateDaysAgo(dc.daysAgo),
          adoptionSource: 'shelter',
          shelterCode: dc.shelterCode,
          isActive: true,
        }),
      );
    }

    // backfill today's daily board from templates for the cat's phase
    const today = new Date().toISOString().slice(0, 10);
    const dayNumber = dayNumberFor(cat.adoptionDate, new Date(today));
    const decompDays = dc.personality === 'shy' ? 5 : 3;
    const phase = phaseForDay(dayNumber, decompDays);
    const phaseTemplates = await templates.find({
      where: { phase, dayInPhase: 1, board: 'daily' },
      order: { orderIndex: 'ASC' },
    });
    const rows = phaseTemplates.map((t, i) => {
      const kanbanStatus: 'done' | 'todo' = i === 0 ? 'done' : 'todo';
      return {
        catId: cat.id,
        dayNumber,
        scheduledDate: today,
        templateId: t.id,
        isCustom: false,
        board: 'daily' as const,
        // mark the first item done for realism (+ completed_at)
        kanbanStatus,
        itemText: t.itemText,
        completedAt: i === 0 ? new Date() : null,
      };
    });
    if (rows.length > 0) {
      await items
        .createQueryBuilder()
        .insert()
        .values(rows)
        .orIgnore()
        .execute();
    }
  }
  console.log(
    `Demo user + ${demoCats.length} cats ensured (user id ${user.id})`,
  );
}

async function main() {
  await AppDataSource.initialize();
  await seedTemplates();
  await seedScenarios();
  await seedDemoUserAndCats();
  await AppDataSource.destroy();
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
