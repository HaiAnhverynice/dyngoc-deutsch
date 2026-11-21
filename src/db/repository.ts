import type { QuizLog } from '@/quiz/types';
import type { Word } from '@/vocab/types';
import type { Card, ContentMeta, ReviewLog, UserDataSnapshot } from './types';

/**
 * Every storage access goes through this interface. Implementations:
 * SQLite (native) and in-memory (Jest, web). Logic stays out of here: repositories
 * only load and store; filtering/scheduling are pure functions elsewhere.
 */
export interface Repository {
  readonly kind: 'sqlite' | 'memory';

  listWords(opts?: { includeDeleted?: boolean }): Promise<Word[]>;
  getWord(id: string): Promise<Word | null>;
  upsertWords(words: Word[]): Promise<void>;

  listCards(): Promise<Card[]>;
  getCardByWordId(wordId: string): Promise<Card | null>;
  saveCard(card: Card): Promise<void>;
  /** Stores the updated card and its log entry atomically. */
  saveReview(card: Card, log: ReviewLog): Promise<void>;
  listReviewLogs(sinceMs?: number): Promise<ReviewLog[]>;

  saveQuizLog(log: QuizLog): Promise<void>;
  listQuizLogs(sinceMs?: number): Promise<QuizLog[]>;

  getSettings(): Promise<Record<string, string>>;
  setSettings(values: Record<string, string>, now: number): Promise<void>;

  listContentMeta(): Promise<ContentMeta[]>;
  setContentMeta(meta: ContentMeta): Promise<void>;

  /** Includes soft-deleted rows so a future sync can propagate deletions. */
  exportUserData(): Promise<UserDataSnapshot>;
  /** Replaces cards, review/quiz logs, settings and imported words. Builtin words are untouched. */
  replaceUserData(data: UserDataSnapshot): Promise<void>;
}
