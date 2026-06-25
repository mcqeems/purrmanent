import { parseMarkdownSlides, slidesSchema } from './markdown-slide.parser';

const SAMPLE = `## Step 1: Warming the Food
Cats frequently refuse cold food.

- [ ] Open the canned food
- [ ] Microwave for 5 seconds
- [ ] Serve in a clean bowl

## Step 2: Quiet Environment
Reduce ambient noise.

- [ ] Turn off the TV
- [ ] Leave for 15 minutes
`;

describe('parseMarkdownSlides', () => {
  it('splits at ## and extracts checkbox todos (spec §2.3)', () => {
    const slides = parseMarkdownSlides(SAMPLE);
    expect(slides).toHaveLength(2);
    expect(slides[0].title).toBe('Step 1: Warming the Food');
    expect(slides[0].todos).toEqual([
      'Open the canned food',
      'Microwave for 5 seconds',
      'Serve in a clean bowl',
    ]);
    // todo lines must not leak into the markdown panel
    expect(slides[0].markdown).not.toMatch(/\[ \]/);
    expect(slides[0].markdown).toContain('refuse cold food');
    expect(slides[1].todos).toHaveLength(2);
  });

  it('produces output that satisfies the slide Zod schema', () => {
    expect(() => slidesSchema.parse(parseMarkdownSlides(SAMPLE))).not.toThrow();
  });

  it('ignores preamble before the first heading', () => {
    const slides = parseMarkdownSlides('intro text\n\n## Only Step\nbody\n- [ ] do it');
    expect(slides).toHaveLength(1);
    expect(slides[0].todos).toEqual(['do it']);
  });
});
