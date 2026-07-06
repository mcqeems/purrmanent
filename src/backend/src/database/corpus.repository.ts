import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface CorpusChunkMeta {
  source?: string;
  sourceUrl?: string;
  topic?: string;
  language?: string;
}

export interface CorpusSearchResult {
  id: number;
  chunk_text: string;
  source: string | null;
  source_url: string | null;
  topic: string | null;
  distance: number;
}

/**
 * Isolates the pgvector quirk: TypeORM has no native vector type,
 * so all writes/reads of `ai_coach_corpus.embedding VECTOR(384)` go through raw
 * parameterized SQL here. The rest of the schema stays idiomatic TypeORM.
 */
@Injectable()
export class CorpusRepository {
  constructor(private readonly dataSource: DataSource) {}

  /** pgvector literal: '[0.1,0.2,...]' */
  private toVector(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  async insertChunk(
    chunkText: string,
    embedding: number[],
    meta: CorpusChunkMeta = {},
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO ai_coach_corpus
         (chunk_text, source, source_url, topic, language, embedding)
       VALUES ($1, $2, $3, $4, $5, $6::vector)`,
      [
        chunkText,
        meta.source ?? null,
        meta.sourceUrl ?? null,
        meta.topic ?? null,
        meta.language ?? 'en',
        this.toVector(embedding),
      ],
    );
  }

  /** Cosine-distance nearest neighbours. */
  async searchSimilar(
    embedding: number[],
    k = 5,
  ): Promise<CorpusSearchResult[]> {
    return this.dataSource.query(
      `SELECT id, chunk_text, source, source_url, topic,
              embedding <=> $1::vector AS distance
       FROM ai_coach_corpus
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [this.toVector(embedding), k],
    );
  }

  /** Used by the corpus ingestion script to make re-runs idempotent. */
  async clear(): Promise<void> {
    await this.dataSource.query('TRUNCATE ai_coach_corpus RESTART IDENTITY');
  }

  async count(): Promise<number> {
    const rows = await this.dataSource.query<Array<{ n: number }>>(
      'SELECT COUNT(*)::int AS n FROM ai_coach_corpus',
    );
    return rows[0]?.n ?? 0;
  }
}
