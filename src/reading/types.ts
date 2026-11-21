import type { Bilingual } from '@/grammar/types';
import type { Level } from '@/vocab/types';

export interface ReadingLine {
  /** Dialogue only: who says it (a short name, e.g. "Minh"). */
  speaker?: string;
  de: string;
  vi: string;
  en: string;
}

export interface GlossaryEntry {
  de: string;
  vi: string;
  en: string;
}

/** Comprehension question asked in German, with translations; choices are German. */
export interface ReadingQuestion {
  id: string;
  de: string;
  vi: string;
  en: string;
  choices: string[];
  answer: number;
  explain: Bilingual;
}

export interface ReadingItem {
  /** Stable key, e.g. `a1.cafe`; progress is linked to it. */
  id: string;
  level: Level;
  kind: 'dialogue' | 'text';
  title: Bilingual;
  intro: Bilingual;
  lines: ReadingLine[];
  glossary: GlossaryEntry[];
  questions: ReadingQuestion[];
}

export interface ReadingFile {
  version: number;
  items: ReadingItem[];
}
