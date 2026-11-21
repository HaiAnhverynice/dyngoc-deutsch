import type { SyncFields } from '@/db/types';

/**
 * meaning  – German word shown, pick its meaning (4 choices)
 * article  – noun shown, pick der/die/das
 * spelling – meaning + gapped example shown, type the German word
 * order    – tap the words of the example sentence into the right order
 * listen   – hear the word (TTS), pick the written German form (4 choices)
 */
export const QUIZ_TYPES = ['meaning', 'article', 'spelling', 'order', 'listen'] as const;
export type QuizType = (typeof QUIZ_TYPES)[number];

/** 'close' = right word with a spelling slip (case, umlaut, ß); counts as correct. */
export type QuizResult = 'correct' | 'close' | 'wrong';

export const CHOICE_COUNT = 4;

export type Question =
  | { type: 'meaning' | 'listen'; wordId: string; choiceIds: string[] }
  | { type: 'article'; wordId: string }
  | { type: 'spelling'; wordId: string; cloze: string | null }
  | { type: 'order'; wordId: string; tokens: string[]; solution: string[]; punctuation: string };

/**
 * Grammar exercises, reading questions and pronunciation self-checks are logged here
 * too (for XP/streak). Their wordId is `grammar:<lesson>:<exercise>`,
 * `reading:<item>:<question>` or the practised word id.
 */
export const LOG_TYPES = [...QUIZ_TYPES, 'grammar', 'reading', 'speaking'] as const;
export type QuizLogType = (typeof LOG_TYPES)[number];

export interface QuizLog extends SyncFields {
  wordId: string;
  type: QuizLogType;
  result: QuizResult;
  answeredAt: number;
  durationMs: number | null;
}
