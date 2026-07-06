import { Injectable, Logger } from '@nestjs/common';

/**
 * Local sentence embeddings via @xenova/transformers + all-MiniLM-L6-v2 (384-d).
 * Runs on CPU, no external API (Bynara has no /embeddings endpoint — R9).
 *
 * @xenova/transformers is ESM-only -> dynamic import(). The feature-extraction
 * pipeline is cached after first load (the model downloads once, ~80MB).
 */
export const EMBEDDING_DIM = 384;
const MODEL = 'Xenova/all-MiniLM-L6-v2';

// module-level singleton so the model loads once per process
let extractorPromise: Promise<
  (text: string, opts: object) => Promise<{ data: Float32Array }>
> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', MODEL),
    ) as Promise<
      (text: string, opts: object) => Promise<{ data: Float32Array }>
    >;
  }
  return extractorPromise;
}

/** Pure embed function (used by the ingestion script and the service). */
export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  embed(text: string): Promise<number[]> {
    return embedText(text);
  }
}
