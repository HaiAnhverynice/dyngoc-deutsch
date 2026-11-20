export const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
export type Level = (typeof LEVELS)[number];

export const ARTICLES = ['der', 'die', 'das'] as const;
export type Article = (typeof ARTICLES)[number];

export const PARTS_OF_SPEECH = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'pronoun',
  'conjunction',
  'article',
  'numeral',
  'particle',
  'interjection',
  'phrase',
] as const;
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];

export interface VerbForms {
  thirdPerson: string;
  preterite: string;
  participle: string;
  auxiliary: 'haben' | 'sein';
}

export interface Example {
  de: string;
  vi: string;
  en: string;
}

/** Shape of one entry in content/vocab/*.json and of JSON imports. */
export interface WordContent {
  /** Stable key, e.g. `de.a1.haus`. Progress is linked to it, never to row order. */
  id: string;
  lemma: string;
  article: Article | null;
  /** Plural form without article ("Häuser"); null = no plural / not a noun. */
  plural: string | null;
  pos: PartOfSpeech;
  level: Level;
  vi: string;
  en: string;
  example: Example;
  tags: string[];
  verb?: VerbForms;
}

export type WordSource = 'builtin' | 'import';

export interface Word extends WordContent {
  source: WordSource;
  /** Teaching order inside the level. */
  sortIndex: number;
  updatedAt: number;
  deleted: boolean;
  userId: string | null;
}

export interface ContentFile {
  version: number;
  level: Level;
  words: WordContent[];
}
