import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

/**
 * Scalable corpus source: each retrievable chunk lives in its own
 * `data/corpus/*.md` file (mirrors the crisis-protocols convention). A small
 * `---` frontmatter block carries the metadata; the markdown body is the chunk
 * text that gets embedded. Add knowledge by dropping in a file — no code edit.
 */
export const CORPUS_DIR = join(process.cwd(), 'data', 'corpus');

export const corpusChunkSchema = z.object({
  text: z.string().min(1),
  source: z.string().min(1).max(100), // matches ai_coach_corpus.source length
  topic: z.string().min(1).max(50),
  sourceUrl: z.string().url().optional(),
  language: z.string().min(2).max(5).optional(),
});
export type CorpusChunk = z.infer<typeof corpusChunkSchema>;

/**
 * Parse a leading `---` frontmatter block plus markdown body. Pure function.
 * Splits each frontmatter line on its FIRST colon, so values may contain colons
 * (e.g. `source: Adaptation: The 3-3-3 Rule`). Empty values are dropped so they
 * fall through to schema optionals rather than failing validation.
 */
export function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const text = raw.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) return { meta: {}, body: text.trim() };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

/** Load + validate every `.md` chunk file in `dir`. Each file = one chunk. */
export function loadCorpusChunks(dir = CORPUS_DIR): CorpusChunk[] {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();

  return files.map((file) => {
    const { meta, body } = parseFrontmatter(readFileSync(join(dir, file), 'utf-8'));
    const parsed = corpusChunkSchema.safeParse({ ...meta, text: body });
    if (!parsed.success) {
      throw new Error(
        `Invalid corpus chunk "${file}": ${parsed.error.issues
          .map((i) => `${i.path.join('.')} ${i.message}`)
          .join('; ')}`,
      );
    }
    return parsed.data;
  });
}
