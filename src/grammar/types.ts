import type { Level } from '@/vocab/types';

export interface Bilingual {
  vi: string;
  en: string;
}

export type LessonBlock =
  | { type: 'text'; vi: string; en: string }
  /** Highlighted hint, e.g. a memory trick or a common mistake. */
  | { type: 'tip'; vi: string; en: string }
  /** Cells are German or language-neutral labels. */
  | { type: 'table'; caption?: Bilingual; head: string[]; rows: string[][] }
  | { type: 'examples'; items: { de: string; vi: string; en: string }[] };

/** Gap-fill multiple choice: `de` contains exactly one "___". */
export interface Exercise {
  id: string;
  de: string;
  choices: string[];
  /** Index into `choices`. */
  answer: number;
  explain: Bilingual;
}

export interface Lesson {
  /** Stable key, e.g. `a1.sein-haben`; progress is linked to it. */
  id: string;
  level: Level;
  title: Bilingual;
  summary: Bilingual;
  blocks: LessonBlock[];
  exercises: Exercise[];
}

export interface GrammarFile {
  version: number;
  level: Level;
  lessons: Lesson[];
}

export const GAP = '___';
