import { addLocalDays, startOfStudyDay, DAY_START_HOUR } from './day';
import type { CardPhase } from './types';

export interface QueueCard {
  id: string;
  wordId: string;
  phase: CardPhase;
  dueAt: number;
  createdAt: number;
}

export interface QueueInput<C extends QueueCard> {
  cards: C[];
  /** Words of the active levels that have no card yet, in teaching order. */
  unseenWordIds: string[];
  now: number;
  /** How many more new cards may be introduced today. */
  newRemaining: number;
  /** Learning cards due within this window are shown early when nothing else is left. */
  learnAheadMs?: number;
}

export type NextItem<C> =
  | { type: 'card'; card: C }
  | { type: 'newWord'; wordId: string }
  | { type: 'done'; nextLearningAt: number | null };

const DEFAULT_LEARN_AHEAD_MS = 20 * 60_000;
const isLearning = (p: CardPhase) => p === 'learning' || p === 'relearning';
const byDue = (a: QueueCard, b: QueueCard) => a.dueAt - b.dueAt || a.createdAt - b.createdAt;

/** Order: due learning → due review → new (within daily limit) → learning soon due. */
export function pickNext<C extends QueueCard>(input: QueueInput<C>): NextItem<C> {
  const { cards, unseenWordIds, now, newRemaining } = input;
  const learnAhead = input.learnAheadMs ?? DEFAULT_LEARN_AHEAD_MS;

  const learning = cards.filter((c) => isLearning(c.phase)).sort(byDue);
  const dueLearning = learning.find((c) => c.dueAt <= now);
  if (dueLearning) return { type: 'card', card: dueLearning };

  const dueReview = cards.filter((c) => c.phase === 'review' && c.dueAt <= now).sort(byDue)[0];
  if (dueReview) return { type: 'card', card: dueReview };

  if (newRemaining > 0) {
    const queuedNew = cards
      .filter((c) => c.phase === 'new')
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (queuedNew) return { type: 'card', card: queuedNew };
    const wordId = unseenWordIds[0];
    if (wordId) return { type: 'newWord', wordId };
  }

  const soon = learning[0];
  if (soon && soon.dueAt <= now + learnAhead) return { type: 'card', card: soon };
  return { type: 'done', nextLearningAt: soon?.dueAt ?? null };
}

export interface DayCounts {
  /** Learning + review cards due before the next study day starts. */
  dueToday: number;
  /** New cards still allowed today (bounded by what is available). */
  newToday: number;
}

export function countToday(
  cards: QueueCard[],
  newAvailable: number,
  introducedToday: number,
  newPerDay: number,
  now: number,
  dayStartHour = DAY_START_HOUR,
): DayCounts {
  const end = addLocalDays(startOfStudyDay(now, dayStartHour), 1);
  const dueToday = cards.filter((c) => c.phase !== 'new' && c.dueAt < end).length;
  const newToday = Math.max(0, Math.min(newAvailable, newPerDay - introducedToday));
  return { dueToday, newToday };
}

/** Number of cards that left the 'new' phase during the current study day. */
export function countIntroducedToday(
  logs: { prevPhase: CardPhase; reviewedAt: number }[],
  now: number,
  dayStartHour = DAY_START_HOUR,
): number {
  const start = startOfStudyDay(now, dayStartHour);
  return logs.filter((l) => l.prevPhase === 'new' && l.reviewedAt >= start).length;
}
