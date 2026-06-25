/* eslint-disable no-console */
import { AppDataSource } from '../database/data-source';
import { CorpusRepository } from '../database/corpus.repository';
import { embedText } from '../common/embeddings/embeddings';
import { PROTOCOLS, loadProtocolSlides } from '../modules/crisis/protocols';

interface SeedChunk {
  text: string;
  source: string;
  sourceUrl?: string;
  topic: string;
}

/**
 * Curated, vetted corpus (spec §8.2). Small, high-signal set for the demo —
 * extend freely; the script is idempotent (clears then re-inserts).
 */
const BASE_CORPUS: SeedChunk[] = [
  {
    text: 'The 3-3-3 rule describes a newly adopted cat\'s adjustment: about 3 days to decompress and feel safe, 3 weeks to learn your routine, and 3 months to feel fully at home. Patience during the first days is key — let the cat set the pace.',
    source: 'Adaptation: The 3-3-3 Rule',
    topic: 'adaptation',
  },
  {
    text: 'Provide a small, quiet "safe room" for a new cat with food, water, a litter box, and hiding spots. Avoid forcing interaction; let the cat explore and approach you on its own terms.',
    source: 'Adaptation: Safe Room Setup',
    topic: 'adaptation',
  },
  {
    text: 'Cats are obligate carnivores and need a meat-based diet. Fresh water should always be available. Sudden diet changes can cause stomach upset; transition foods gradually over 7-10 days.',
    source: 'Nutrition Basics',
    topic: 'nutrition',
  },
  {
    text: 'Adult cats typically eat two measured meals per day. Monitor body condition rather than free-feeding to prevent obesity, a common feline health problem.',
    source: 'Nutrition: Feeding Schedule',
    topic: 'nutrition',
  },
  {
    text: 'Provide one litter box per cat plus one extra, in quiet accessible locations. Scoop daily. Sudden litter box avoidance can indicate a medical issue such as a urinary tract problem and warrants a vet visit.',
    source: 'Behavior: Litter Box',
    topic: 'behavior',
  },
  {
    text: 'Play aggression and petting-induced aggression are common and usually about overstimulation. Watch body language (tail flicks, flattened ears) and end interactions before the cat becomes overwhelmed.',
    source: 'Behavior: Aggression',
    topic: 'behavior',
  },
  {
    text: 'Core vaccinations for cats include FVRCP and rabies. Kittens need a series of boosters; adults need periodic boosters. Keep a record of dates and next-due reminders.',
    source: 'Health: Vaccinations (AAFP guidance)',
    topic: 'health',
  },
  {
    text: 'A cat that has not eaten for 24 hours, is hiding and unresponsive, has pale gums, or is straining to urinate without producing urine needs urgent veterinary care.',
    source: 'Health: When to See a Vet',
    topic: 'health',
  },
];

async function main() {
  await AppDataSource.initialize();
  const corpus = new CorpusRepository(AppDataSource);

  console.log('Clearing existing corpus…');
  await corpus.clear();

  // crisis protocol slides become retrievable chunks too
  const protocolChunks: SeedChunk[] = PROTOCOLS.flatMap((p) =>
    loadProtocolSlides(p.file).map((s) => ({
      text: `${s.title}. ${s.markdown} Steps: ${s.todos.join('; ')}`,
      source: `Crisis Protocol: ${p.name}`,
      topic: 'health',
    })),
  );

  const all = [...BASE_CORPUS, ...protocolChunks];
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
