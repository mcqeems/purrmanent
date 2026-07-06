import { matchProtocol, loadProtocolSlides, PROTOCOLS } from './protocols';

describe('matchProtocol (rule engine)', () => {
  it('matches known symptom keywords to the right scenario', () => {
    expect(matchProtocol('my cat is not eating')?.scenarioKey).toBe(
      'fasting_24h',
    );
    expect(matchProtocol('she keeps hiding under the bed')?.scenarioKey).toBe(
      'hiding_3d',
    );
    expect(matchProtocol('he is biting and hissing')?.scenarioKey).toBe(
      'aggressive',
    );
    expect(matchProtocol('peeing outside the litter box')?.scenarioKey).toBe(
      'urination',
    );
    expect(matchProtocol('very lethargic and weak')?.scenarioKey).toBe(
      'lethargy',
    );
  });

  it('returns null for an unmatched prompt (triggers AI fallback)', () => {
    expect(
      matchProtocol('my cat keeps meowing at the window at dawn'),
    ).toBeNull();
  });
});

describe('loadProtocolSlides', () => {
  it('parses every protocol file into non-empty slides with todos', () => {
    for (const p of PROTOCOLS) {
      const slides = loadProtocolSlides(p.file);
      expect(slides.length).toBeGreaterThan(0);
      expect(slides.every((s) => s.title.length > 0)).toBe(true);
      expect(slides.some((s) => s.todos.length > 0)).toBe(true);
    }
  });

  it('parses fasting_24h.md into the expected slide count', () => {
    const slides = loadProtocolSlides('fasting_24h.md');
    expect(slides).toHaveLength(4);
    expect(slides[0].title).toContain('Warm the Food');
    expect(slides[0].todos.length).toBeGreaterThanOrEqual(3);
  });
});
