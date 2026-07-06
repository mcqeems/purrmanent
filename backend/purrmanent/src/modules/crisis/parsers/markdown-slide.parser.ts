import { z } from 'zod';

/** A single crisis slide: one markdown panel + one todo list. */
export const slideSchema = z.object({
  title: z.string(),
  markdown: z.string(),
  todos: z.array(z.string()),
});
export const slidesSchema = z.array(slideSchema);
export type Slide = z.infer<typeof slideSchema>;

/**
 * Splits a protocol markdown document into slides at `##` headings and extracts
 * `- [ ]` / `- [x]` checkbox lines as todos. Pure function.
 *
 * The markdown body of each slide excludes the todo checkbox lines (they render
 * in the dedicated todo panel, not the markdown panel).
 */
export function parseMarkdownSlides(md: string): Slide[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const slides: Slide[] = [];
  let current: { title: string; body: string[]; todos: string[] } | null = null;

  const flush = () => {
    if (current) {
      slides.push({
        title: current.title.trim(),
        markdown: current.body.join('\n').trim(),
        todos: current.todos,
      });
    }
  };

  for (const line of lines) {
    const heading = /^##\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      current = { title: heading[1], body: [], todos: [] };
      continue;
    }
    if (!current) continue; // skip preamble before the first heading
    const todo = /^\s*-\s*\[[ xX]\]\s+(.*)$/.exec(line);
    if (todo) {
      current.todos.push(todo[1].trim());
    } else {
      current.body.push(line);
    }
  }
  flush();
  return slides;
}
