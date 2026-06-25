import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tavily } from '@tavily/core';
import { EmbeddingsService } from '../../common/embeddings/embeddings';
import { CorpusRepository } from '../../database/corpus.repository';
import type { Env } from '../../config/env';

export interface RetrievedChunk {
  text: string;
  source: string | null;
  sourceUrl: string | null;
  distance: number;
}

/**
 * Framework-agnostic Copilot tools (plan §3.5/§7). Driven directly here rather
 * than through a Flue harness (R3). Shared shape so Crisis AI-fallback could
 * reuse them later.
 */
@Injectable()
export class CoachToolsService {
  private readonly logger = new Logger(CoachToolsService.name);
  private readonly tavilyKey?: string;

  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly corpus: CorpusRepository,
    config: ConfigService<Env, true>,
  ) {
    this.tavilyKey = config.get('TAVILY_API_KEY', { infer: true });
  }

  /** Embed the query and return the top-k nearest corpus chunks (RAG). */
  async retrieveCorpus(query: string, k = 5): Promise<RetrievedChunk[]> {
    const vec = await this.embeddings.embed(query);
    const rows = await this.corpus.searchSimilar(vec, k);
    return rows.map((r) => ({
      text: r.chunk_text,
      source: r.source,
      sourceUrl: r.source_url,
      distance: Number(r.distance),
    }));
  }

  /** Web-search fallback (shared with Crisis). Returns cleaned snippets. */
  async webSearch(query: string, k = 3): Promise<RetrievedChunk[]> {
    if (!this.tavilyKey) {
      this.logger.warn('TAVILY_API_KEY unset — webSearch disabled');
      return [];
    }
    try {
      const client = tavily({ apiKey: this.tavilyKey });
      const res = await client.search(query, { maxResults: k });
      return (res.results ?? []).map((r) => ({
        text: r.content,
        source: r.title,
        sourceUrl: r.url,
        distance: 0,
      }));
    } catch (err) {
      this.logger.error(`webSearch failed: ${String(err)}`);
      return [];
    }
  }
}
