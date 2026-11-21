import type { QuizResult } from '@/quiz/types';
import type { Rating } from '@/srs/types';
import { summarizeProgress, XP_QUIZ, XP_REVIEW } from './index';

// TZ is Europe/Berlin in Jest; study days start at 04:00 local.
const at = (d: number, h: number, m = 0) => new Date(2026, 2, d, h, m).getTime();
const review = (ms: number, rating: Rating = 'good') => ({
  rating,
  reviewedAt: ms,
  deleted: false,
});
const quiz = (ms: number, result: QuizResult = 'correct') => ({
  result,
  answeredAt: ms,
  deleted: false,
});

describe('summarizeProgress', () => {
  it('sums XP per day and in total', () => {
    const s = summarizeProgress(
      [review(at(10, 9), 'again'), review(at(10, 9), 'easy')],
      [quiz(at(10, 10)), quiz(at(10, 10), 'wrong'), quiz(at(9, 10), 'close')],
      at(10, 20),
    );
    expect(s.xpToday).toBe(XP_REVIEW.again + XP_REVIEW.easy + XP_QUIZ.correct + XP_QUIZ.wrong);
    expect(s.xpTotal).toBe(s.xpToday + XP_QUIZ.close);
    const today = s.week[6]!;
    expect(today).toMatchObject({ reviews: 2, quizzes: 2, quizPassed: 1 });
  });

  it('returns 7 days oldest first, today last, zero-filled', () => {
    const s = summarizeProgress([review(at(5, 12))], [], at(10, 12));
    expect(s.week).toHaveLength(7);
    expect(s.week.map((d) => new Date(d.start).getDate())).toEqual([4, 5, 6, 7, 8, 9, 10]);
    expect(s.week.map((d) => d.reviews)).toEqual([0, 1, 0, 0, 0, 0, 0]);
    expect(new Date(s.week[0]!.start).getHours()).toBe(4);
  });

  it('counts 01:00 activity toward the previous study day', () => {
    const s = summarizeProgress([review(at(11, 1))], [], at(11, 2));
    expect(s.activeToday).toBe(true);
    expect(new Date(s.week[6]!.start).getDate()).toBe(10);
  });

  it('keeps the streak alive until today ends, then breaks it', () => {
    const logs = [review(at(7, 9)), review(at(8, 9)), review(at(9, 9))];
    expect(summarizeProgress(logs, [], at(9, 22))).toMatchObject({ streak: 3, activeToday: true });
    // Day 10, nothing yet: yesterday's streak still counts.
    expect(summarizeProgress(logs, [], at(10, 22))).toMatchObject({
      streak: 3,
      activeToday: false,
    });
    // Day 11: day 10 was missed.
    expect(summarizeProgress(logs, [], at(11, 9)).streak).toBe(0);
  });

  it('tracks the best streak separately from the current one', () => {
    const logs = [1, 2, 3, 4, 7, 8].map((d) => review(at(d, 12)));
    expect(summarizeProgress(logs, [quiz(at(9, 12))], at(9, 13))).toMatchObject({
      streak: 3,
      bestStreak: 4,
    });
  });

  it('crosses the DST change (29 March 2026 in Berlin) without gaps', () => {
    const logs = [27, 28, 29, 30].map((d) => review(at(d, 12)));
    const s = summarizeProgress(logs, [], at(30, 13));
    expect(s.streak).toBe(4);
    expect(s.week.map((d) => new Date(d.start).getDate())).toEqual([24, 25, 26, 27, 28, 29, 30]);
  });

  it('ignores soft-deleted logs', () => {
    const s = summarizeProgress([{ ...review(at(10, 9)), deleted: true }], [], at(10, 10));
    expect(s).toMatchObject({ xpTotal: 0, streak: 0, activeToday: false });
  });
});
