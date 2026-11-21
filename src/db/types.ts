import type { QuizLog } from '@/quiz/types';
import type { CardPhase, Rating, SrsState } from '@/srs/types';
import type { Word } from '@/vocab/types';

/** Fields every user-owned record carries (sync-ready). */
export interface SyncFields {
  id: string;
  updatedAt: number;
  deleted: boolean;
  /** Reserved for future sync; always null for now. */
  userId: string | null;
}

/** 'recognize' = German → meaning. Later phases may add e.g. 'produce' or 'article'. */
export type CardKind = 'recognize';

export interface Card extends SrsState, SyncFields {
  wordId: string;
  kind: CardKind;
  createdAt: number;
}

export interface ReviewLog extends SyncFields {
  cardId: string;
  wordId: string;
  rating: Rating;
  prevPhase: CardPhase;
  nextPhase: CardPhase;
  prevIntervalDays: number;
  nextIntervalDays: number;
  ease: number;
  reviewedAt: number;
  durationMs: number | null;
}

export interface ContentMeta {
  source: string;
  version: number;
  updatedAt: number;
}

/** Everything user-specific; used by backup and by the web persistence layer. */
export interface UserDataSnapshot {
  settings: Record<string, string>;
  cards: Card[];
  reviewLogs: ReviewLog[];
  quizLogs: QuizLog[];
  /** Only user-imported words; builtin words come from bundled content. */
  importedWords: Word[];
}
