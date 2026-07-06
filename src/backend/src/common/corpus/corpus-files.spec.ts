import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseFrontmatter, loadCorpusChunks, CORPUS_DIR } from './corpus-files';

describe('parseFrontmatter', () => {
  it('splits frontmatter on the first colon so values may contain colons', () => {
    const { meta, body } = parseFrontmatter(
      '---\nsource: Adaptation: The 3-3-3 Rule\ntopic: adaptation\n---\nBody text here.',
    );
    expect(meta.source).toBe('Adaptation: The 3-3-3 Rule');
    expect(meta.topic).toBe('adaptation');
    expect(body).toBe('Body text here.');
  });

  it('handles CRLF and drops empty values', () => {
    const { meta, body } = parseFrontmatter(
      '---\r\nsource: X\r\nsourceUrl:\r\n---\r\nHello.\r\n',
    );
    expect(meta.source).toBe('X');
    expect(meta.sourceUrl).toBeUndefined();
    expect(body).toBe('Hello.');
  });

  it('treats a file with no frontmatter as pure body', () => {
    expect(parseFrontmatter('just text')).toEqual({
      meta: {},
      body: 'just text',
    });
  });
});

describe('loadCorpusChunks', () => {
  it('loads + validates one chunk per .md file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'corpus-'));
    try {
      writeFileSync(
        join(dir, 'a.md'),
        '---\nsource: Nutrition Basics\ntopic: nutrition\n---\nCats are obligate carnivores.',
      );
      const chunks = loadCorpusChunks(dir);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({
        source: 'Nutrition Basics',
        topic: 'nutrition',
        text: 'Cats are obligate carnivores.',
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('throws a file-named error on an invalid chunk', () => {
    const dir = mkdtempSync(join(tmpdir(), 'corpus-'));
    try {
      writeFileSync(join(dir, 'bad.md'), '---\ntopic: nutrition\n---\n'); // empty body
      expect(() => loadCorpusChunks(dir)).toThrow(/bad\.md/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('every real corpus chunk file is valid', () => {
    const chunks = loadCorpusChunks(CORPUS_DIR);
    expect(chunks.length).toBeGreaterThanOrEqual(8);
  });
});
