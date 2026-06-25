import {
  generatePlan,
  phaseForDay,
  dayNumberFor,
  SHY_DECOMPRESSION_DAYS,
  DEFAULT_DECOMPRESSION_DAYS,
} from './plan';

describe('generatePlan', () => {
  it('extends decompression for shy cats (spec §2.2 acceptance)', () => {
    const plan = generatePlan({ catPersonality: 'shy' });
    expect(plan.decompressionDays).toBe(SHY_DECOMPRESSION_DAYS);
    expect(plan.phases[0]).toMatchObject({ phase: 'decompression', endDay: 5 });
    expect(plan.phases[1].startDay).toBe(6);
  });

  it('uses default decompression for non-shy cats', () => {
    const plan = generatePlan({ catPersonality: 'balanced' });
    expect(plan.decompressionDays).toBe(DEFAULT_DECOMPRESSION_DAYS);
  });

  it('enables educational tooltips for first-time adopters', () => {
    expect(
      generatePlan({
        catPersonality: 'active',
        adopterExperience: 'first-time',
      }).showEducationalTooltips,
    ).toBe(true);
    expect(
      generatePlan({
        catPersonality: 'active',
        adopterExperience: 'experienced',
      }).showEducationalTooltips,
    ).toBe(false);
  });
});

describe('phaseForDay', () => {
  it('maps the 3-3-3 windows with default decompression', () => {
    expect(phaseForDay(1)).toBe('decompression');
    expect(phaseForDay(3)).toBe('decompression');
    expect(phaseForDay(4)).toBe('routine');
    expect(phaseForDay(21)).toBe('routine');
    expect(phaseForDay(22)).toBe('home');
    expect(phaseForDay(90)).toBe('home');
  });

  it('respects an extended decompression window (shy)', () => {
    expect(phaseForDay(4, SHY_DECOMPRESSION_DAYS)).toBe('decompression');
    expect(phaseForDay(5, SHY_DECOMPRESSION_DAYS)).toBe('decompression');
    expect(phaseForDay(6, SHY_DECOMPRESSION_DAYS)).toBe('routine');
  });
});

describe('dayNumberFor', () => {
  it('treats the adoption date as Day 1', () => {
    expect(dayNumberFor('2026-06-01', new Date('2026-06-01T10:00:00Z'))).toBe(
      1,
    );
    expect(dayNumberFor('2026-06-01', new Date('2026-06-03T10:00:00Z'))).toBe(
      3,
    );
  });
});
