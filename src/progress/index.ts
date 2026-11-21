import type { ReviewLog } from '@/db/types';
import type { QuizLog, QuizResult } from '@/quiz/types';
import { addLocalDays, startOfStudyDay, studyDayIndex } from '@/srs/day';
import type { Rating } from '@/srs/types';

/**
 * XP is derived from the logs at read time (never stored), so tuning these numbers
 * re-scores history consistently and backups need nothing extra.
 */
export const XP_REVIEW: Record<Rating, number> = { again: 2, hard: 4, good: 5, easy: 5 };
export const XP_QUIZ: Record<QuizResult, number> = { correct: 10, close: 7, wrong: 2 };

export interface DayStat {
  /** Start of the study day (local 04:00). */
  start: number;
  reviews: number;
  quizzes: number;
  quizPassed: number;
  xp: number;
}

export interface ProgressSummary {
  /** Consecutive study days with any review or quiz, ending today (or yesterday if today is still open). */
  streak: number;
  bestStreak: number;
  activeToday: boolean;
  xpToday: number;
  xpTotal: number;
  /** Last 7 study days, oldest first, today last. */
  week: DayStat[];
}

type ReviewLike = Pick<ReviewLog, 'rating' | 'reviewedAt' | 'deleted'>;
type QuizLike = Pick<QuizLog, 'result' | 'answeredAt' | 'deleted'>;

const emptyDay = (start: number): DayStat => ({
  start,
  reviews: 0,
  quizzes: 0,
  quizPassed: 0,
  xp: 0,
});

/** Per-day totals keyed by study-day index. */
export function statsByDay(
  reviews: readonly ReviewLike[],
  quizzes: readonly QuizLike[],
): Map<number, DayStat> {
  const days = new Map<number, DayStat>();
  const day = (ms: number) => {
    const i = studyDayIndex(ms);
    let d = days.get(i);
    if (!d) days.set(i, (d = emptyDay(startOfStudyDay(ms))));
    return d;
  };
  for (const r of reviews) {
    if (r.deleted) continue;
    const d = day(r.reviewedAt);
    d.reviews++;
    d.xp += XP_REVIEW[r.rating];
  }
  for (const q of quizzes) {
    if (q.deleted) continue;
    const d = day(q.answeredAt);
    d.quizzes++;
    if (q.result !== 'wrong') d.quizPassed++;
    d.xp += XP_QUIZ[q.result];
  }
  return days;
}

/** Longest run of consecutive indices, and the run ending at `end` (0 if `end` is absent). */
function runs(active: Set<number>, end: number): { best: number; endingAt: number } {
  let best = 0;
  for (const i of active) {
    if (active.has(i - 1)) continue; // not a run start
    let len = 1;
    while (active.has(i + len)) len++;
    best = Math.max(best, len);
  }
  let endingAt = 0;
  while (active.has(end - endingAt)) endingAt++;
  return { best, endingAt };
}

export function summarizeProgress(
  reviews: readonly ReviewLike[],
  quizzes: readonly QuizLike[],
  now: number,
  days = 7,
): ProgressSummary {
  const byDay = statsByDay(reviews, quizzes);
  const today = studyDayIndex(now);
  const active = new Set([...byDay].filter(([, d]) => d.reviews + d.quizzes > 0).map(([i]) => i));
  const activeToday = active.has(today);
  const { best, endingAt } = runs(active, activeToday ? today : today - 1);

  const todayStart = startOfStudyDay(now);
  const week: DayStat[] = [];
  for (let k = days - 1; k >= 0; k--) {
    const start = addLocalDays(todayStart, -k);
    week.push(byDay.get(studyDayIndex(start)) ?? emptyDay(start));
  }

  let xpTotal = 0;
  for (const d of byDay.values()) xpTotal += d.xp;

  return {
    streak: endingAt,
    bestStreak: best,
    activeToday,
    xpToday: byDay.get(today)?.xp ?? 0,
    xpTotal,
    week,
  };
}
