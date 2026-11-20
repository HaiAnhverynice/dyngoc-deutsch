import { addLocalDays, startOfStudyDay, studyDayIndex, DAY_START_HOUR } from './day';
import type { Rating, Scheduler, SrsState } from './types';

export interface Sm2Config {
  learningStepsMin: number[];
  relearningStepsMin: number[];
  graduatingIntervalDays: number;
  easyIntervalDays: number;
  startingEase: number;
  minEase: number;
  maxEase: number;
  easyBonus: number;
  hardFactor: number;
  /** New interval after a lapse = old interval × factor (at least minLapseIntervalDays). */
  lapseIntervalFactor: number;
  minLapseIntervalDays: number;
  maxIntervalDays: number;
  dayStartHour: number;
}

export const DEFAULT_SM2_CONFIG: Sm2Config = {
  learningStepsMin: [1, 10],
  relearningStepsMin: [10],
  graduatingIntervalDays: 1,
  easyIntervalDays: 4,
  startingEase: 2.5,
  minEase: 1.3,
  maxEase: 3.5,
  easyBonus: 1.3,
  hardFactor: 1.2,
  lapseIntervalFactor: 0,
  minLapseIntervalDays: 1,
  maxIntervalDays: 36500,
  dayStartHour: DAY_START_HOUR,
};

const EASE_DELTA: Record<Rating, number> = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 };
const MINUTE = 60_000;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function createSm2Scheduler(overrides: Partial<Sm2Config> = {}): Scheduler {
  const cfg: Sm2Config = { ...DEFAULT_SM2_CONFIG, ...overrides };
  if (cfg.learningStepsMin.length === 0 || cfg.relearningStepsMin.length === 0) {
    throw new Error('SM-2 config needs at least one learning and one relearning step');
  }

  const clampEase = (e: number) => round2(Math.min(cfg.maxEase, Math.max(cfg.minEase, e)));
  const clampIvl = (d: number) => Math.min(cfg.maxIntervalDays, Math.max(1, Math.round(d)));
  /** Review cards become due at the start of the study day `days` after today. */
  const dueInDays = (now: number, days: number) =>
    addLocalDays(startOfStudyDay(now, cfg.dayStartHour), days);

  const toReview = (s: SrsState, now: number, ivl: number, ease: number) => ({
    ...s,
    phase: 'review' as const,
    step: 0,
    ease,
    intervalDays: ivl,
    dueAt: dueInDays(now, ivl),
    reps: s.reps + 1,
    lastReviewAt: now,
  });

  /** Shared step logic for learning (new cards) and relearning (lapsed cards). */
  function stepped(s: SrsState, rating: Rating, now: number, steps: number[]): SrsState {
    const relearning = s.phase === 'relearning';
    const phase = relearning ? 'relearning' : 'learning';
    const step = Math.min(s.step, steps.length - 1);
    const inStep = (idx: number, delayMin: number): SrsState => ({
      ...s,
      phase,
      step: idx,
      dueAt: now + delayMin * MINUTE,
      reps: s.reps + 1,
      lastReviewAt: now,
    });

    switch (rating) {
      case 'again':
        return inStep(0, steps[0]!);
      case 'hard': {
        // On the first step, Hard waits halfway between step 1 and 2; otherwise repeats the step.
        const delay = step === 0 && steps.length > 1 ? (steps[0]! + steps[1]!) / 2 : steps[step]!;
        return inStep(step, delay);
      }
      case 'good': {
        const next = step + 1;
        if (next < steps.length) return inStep(next, steps[next]!);
        const ivl = relearning ? s.intervalDays : cfg.graduatingIntervalDays;
        return toReview(s, now, clampIvl(ivl), s.ease);
      }
      case 'easy': {
        const ivl = relearning ? s.intervalDays + 1 : cfg.easyIntervalDays;
        return toReview(s, now, clampIvl(ivl), s.ease);
      }
    }
  }

  function reviewPhase(s: SrsState, rating: Rating, now: number): SrsState {
    const ease = clampEase(s.ease + EASE_DELTA[rating]);
    if (rating === 'again') {
      const ivl = Math.max(
        cfg.minLapseIntervalDays,
        Math.round(s.intervalDays * cfg.lapseIntervalFactor),
      );
      return {
        ...s,
        phase: 'relearning',
        step: 0,
        ease,
        intervalDays: Math.min(cfg.maxIntervalDays, ivl),
        dueAt: now + cfg.relearningStepsMin[0]! * MINUTE,
        reps: s.reps + 1,
        lapses: s.lapses + 1,
        lastReviewAt: now,
      };
    }

    const cur = Math.max(1, s.intervalDays);
    const daysLate = Math.max(
      0,
      studyDayIndex(now, cfg.dayStartHour) - studyDayIndex(s.dueAt, cfg.dayStartHour),
    );
    // Anki-style: lateness proves retention, so it partially extends the next interval.
    const hardIvl = clampIvl(Math.max(cur + 1, (cur + daysLate / 4) * cfg.hardFactor));
    if (rating === 'hard') return toReview(s, now, hardIvl, ease);
    const goodIvl = clampIvl(Math.max(hardIvl + 1, (cur + daysLate / 2) * s.ease));
    if (rating === 'good') return toReview(s, now, goodIvl, ease);
    const easyIvl = clampIvl(Math.max(goodIvl + 1, (cur + daysLate) * s.ease * cfg.easyBonus));
    return toReview(s, now, easyIvl, ease);
  }

  const scheduler: Scheduler = {
    name: 'sm2',
    initialState: (now) => ({
      phase: 'new',
      step: 0,
      ease: cfg.startingEase,
      intervalDays: 0,
      dueAt: now,
      reps: 0,
      lapses: 0,
      lastReviewAt: null,
    }),
    review(state, rating, now) {
      switch (state.phase) {
        case 'new':
          return stepped(
            { ...state, phase: 'learning', step: 0 },
            rating,
            now,
            cfg.learningStepsMin,
          );
        case 'learning':
          return stepped(state, rating, now, cfg.learningStepsMin);
        case 'relearning':
          return stepped(state, rating, now, cfg.relearningStepsMin);
        case 'review':
          return reviewPhase(state, rating, now);
      }
    },
    preview(state, now) {
      return {
        again: scheduler.review(state, 'again', now),
        hard: scheduler.review(state, 'hard', now),
        good: scheduler.review(state, 'good', now),
        easy: scheduler.review(state, 'easy', now),
      };
    },
  };
  return scheduler;
}
