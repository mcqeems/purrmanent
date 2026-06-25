import { buildCoachPrompt } from './coach.prompt';

describe('buildCoachPrompt (@mention context, spec §8.5)', () => {
  it('injects the mentioned column card texts into the system prompt', () => {
    const msgs = buildCoachPrompt({
      message: 'Why is my cat ignoring tasks in @todo?',
      contextMention: 'todo',
      mentionedTasks: ['Offer wet food', 'Refill water bowl'],
      retrieved: [],
      language: 'en',
    });
    const system = msgs[0].content;
    expect(msgs[0].role).toBe('system');
    expect(system).toContain('Offer wet food');
    expect(system).toContain('Refill water bowl');
    expect(system).toContain('"todo" tasks');
    expect(msgs[1]).toEqual({
      role: 'user',
      content: 'Why is my cat ignoring tasks in @todo?',
    });
  });

  it('cites retrieved passages and sets the reply language', () => {
    const msgs = buildCoachPrompt({
      message: 'feeding tips?',
      contextMention: null,
      mentionedTasks: [],
      retrieved: [
        { text: 'Cats need fresh water daily.', source: 'Nutrition', sourceUrl: null, distance: 0.1 },
      ],
      language: 'id',
    });
    expect(msgs[0].content).toContain('[1] Cats need fresh water daily.');
    expect(msgs[0].content).toContain('language code "id"');
  });
});
