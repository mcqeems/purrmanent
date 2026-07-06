import { Injectable, Logger } from '@nestjs/common';
import { embedText } from '../../common/embeddings/embeddings';
import { CorpusRepository } from '../../database/corpus.repository';

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

  constructor(private readonly corpus: CorpusRepository) {}

  /** Embed the query and return the top-k nearest corpus chunks (RAG). */
  async retrieveCorpus(query: string, k = 5): Promise<RetrievedChunk[]> {
    const vec = await embedText(query);
    const rows = await this.corpus.searchSimilar(vec, k);
    return rows.map((r) => ({
      text: r.chunk_text,
      source: r.source,
      sourceUrl: r.source_url,
      distance: Number(r.distance),
    }));
  }
}
