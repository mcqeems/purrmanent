import { AppDataSource } from '../database/data-source';
import { CorpusRepository } from '../database/corpus.repository';
import { embedText } from '../common/embeddings/embeddings';
import { PROTOCOLS, loadProtocolSlides } from '../modules/crisis/protocols';
import { CorpusChunk, loadCorpusChunks } from '../common/corpus/corpus-files';

async function main() {
  await AppDataSource.initialize();
  const corpus = new CorpusRepository(AppDataSource);

  console.log('Clearing existing corpus…');
  await corpus.clear();

  // curated knowledge: one chunk per file under data/corpus/ (spec §8.2)
  const baseChunks = loadCorpusChunks();

  // crisis protocol slides become retrievable chunks too
  const protocolChunks: CorpusChunk[] = PROTOCOLS.flatMap((p) =>
    loadProtocolSlides(p.file).map((s) => ({
      text: `${s.title}. ${s.markdown} Steps: ${s.todos.join('; ')}`,
      source: `Crisis Protocol: ${p.name}`,
      topic: 'health',
    })),
  );

  const all = [...baseChunks, ...protocolChunks];
  console.log(`Embedding + inserting ${all.length} chunks…`);
  for (const chunk of all) {
    const embedding = await embedText(chunk.text);
    await corpus.insertChunk(chunk.text, embedding, {
      source: chunk.source,
      sourceUrl: chunk.sourceUrl,
      topic: chunk.topic,
    });
  }

  const count = await corpus.count();
  console.log(`Done. Corpus now has ${count} chunks.`);
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
