import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseMarkdownSlides, Slide } from './parsers/markdown-slide.parser';

export interface ProtocolMeta {
  scenarioKey: string;
  name: string;
  icon: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  /** lowercase keywords matched against the user's symptom prompt (§2.3 rule). */
  keywords: string[];
  file: string;
}

/** The 5 core rule-based protocols (spec §2.3 / plan §6). */
export const PROTOCOLS: ProtocolMeta[] = [
  {
    scenarioKey: 'fasting_24h',
    name: 'Not Eating / Fasting',
    icon: '🍽️',
    severity: 'high',
    keywords: ['not eating', 'won\'t eat', 'wont eat', 'refusing food', 'fasting', 'no appetite', 'hasn\'t eaten', 'hasnt eaten', 'starving'],
    file: 'fasting_24h.md',
  },
  {
    scenarioKey: 'hiding_3d',
    name: 'Hiding for Days',
    icon: '🙈',
    severity: 'medium',
    keywords: ['hiding', 'hides', 'won\'t come out', 'wont come out', 'scared', 'under the bed', 'not coming out'],
    file: 'hiding_3d.md',
  },
  {
    scenarioKey: 'aggressive',
    name: 'Aggressive Behaviour',
    icon: '😾',
    severity: 'medium',
    keywords: ['aggressive', 'aggression', 'biting', 'bites', 'scratching', 'hissing', 'attacking', 'attacks', 'growling'],
    file: 'aggressive.md',
  },
  {
    scenarioKey: 'urination',
    name: 'Litter Box / Urination',
    icon: '🚽',
    severity: 'high',
    keywords: ['litter box', 'litterbox', 'urinating', 'peeing', 'not using litter', 'straining', 'blood in urine', 'accidents', 'won\'t pee', 'cant pee'],
    file: 'urination.md',
  },
  {
    scenarioKey: 'lethargy',
    name: 'Lethargy / Low Energy',
    icon: '😴',
    severity: 'high',
    keywords: ['lethargic', 'lethargy', 'no energy', 'not moving', 'weak', 'sleeping all day', 'unresponsive', 'sluggish', 'limp'],
    file: 'lethargy.md',
  },
];

const PROTOCOL_DIR = join(process.cwd(), 'data', 'crisis-protocols');

/** Read + parse a protocol's markdown into slides. */
export function loadProtocolSlides(file: string): Slide[] {
  const md = readFileSync(join(PROTOCOL_DIR, file), 'utf-8');
  return parseMarkdownSlides(md);
}

/** Rule match: first protocol whose keyword appears in the prompt. */
export function matchProtocol(prompt: string): ProtocolMeta | null {
  const p = prompt.toLowerCase();
  return PROTOCOLS.find((proto) => proto.keywords.some((k) => p.includes(k))) ?? null;
}
