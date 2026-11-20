import type { Repository } from '@/db/repository';
import type { Card, ReviewLog } from '@/db/types';
import { countIntroducedToday, countToday } from '@/srs/queue';
import { startOfStudyDay } from '@/srs/day';
import type { Rating, Scheduler } from '@/srs/types';
import { unseenWordIds } from '@/vocab/filter';
import type { Word } from '@/vocab/types';
import type { AppSettings } from './settings';

export type IdFactory = () => string;

export function newCard(wordId: string, scheduler: Scheduler, now: number, id: string): Card {
  return {
    ...scheduler.initialState(now),
    id,
    wordId,
    kind: 'recognize',
    createdAt: now,
    updatedAt: now,
    deleted: false,
    userId: null,
  };
}

/** Applies a rating; returns the stored card and log. */
export async function answerCard(
  repo: Repository,
  scheduler: Scheduler,
  card: Card,
  rating: Rating,
  now: number,
  durationMs: number | null,
  makeId: IdFactory,
): Promise<{ card: Card; log: ReviewLog }> {
  const next: Card = { ...card, ...scheduler.review(card, rating, now), updatedAt: now };
  const log: ReviewLog = {
    id: makeId(),
    cardId: card.id,
    wordId: card.wordId,
    rating,
    prevPhase: card.phase,
    nextPhase: next.phase,
    prevIntervalDays: card.intervalDays,
    nextIntervalDays: next.intervalDays,
    ease: next.ease,
    reviewedAt: now,
    durationMs,
    updatedAt: now,
    deleted: false,
    userId: null,
  };
  await repo.saveReview(next, log);
  return { card: next, log };
}

/** "Add to study": creates a new-phase card if the word has none. */
export async function addToStudy(
  repo: Repository,
  scheduler: Scheduler,
  wordId: string,
  now: number,
  makeId: IdFactory,
): Promise<Card> {
  const existing = await repo.getCardByWordId(wordId);
  if (existing) return existing;
  const card = newCard(wordId, scheduler, now, makeId());
  await repo.saveCard(card);
  return card;
}

export interface StudySnapshot {
  words: Word[];
  wordsById: Map<string, Word>;
  /** Cards whose word still exists. */
  cards: Card[];
  unseen: string[];
  introducedToday: number;
  dueToday: number;
  newToday: number;
  learned: number;
  mature: number;
}

export const MATURE_DAYS = 21;

export async function loadStudySnapshot(
  repo: Repository,
  settings: AppSettings,
  now: number,
): Promise<StudySnapshot> {
  const [words, allCards, logs] = await Promise.all([
    repo.listWords(),
    repo.listCards(),
    repo.listReviewLogs(startOfStudyDay(now)),
  ]);
  const wordsById = new Map(words.map((w) => [w.id, w]));
  const cards = allCards.filter((c) => wordsById.has(c.wordId));
  const unseen = unseenWordIds(words, settings.levels, new Set(allCards.map((c) => c.wordId)));
  const introducedToday = countIntroducedToday(logs, now);
  const queuedNew = cards.filter((c) => c.phase === 'new').length;
  const counts = countToday(
    cards,
    unseen.length + queuedNew,
    introducedToday,
    settings.newPerDay,
    now,
  );
  return {
    words,
    wordsById,
    cards,
    unseen,
    introducedToday,
    ...counts,
    learned: cards.filter((c) => c.phase !== 'new').length,
    mature: cards.filter((c) => c.phase === 'review' && c.intervalDays >= MATURE_DAYS).length,
  };
}
