export const RATINGS = ['again', 'hard', 'good', 'easy'] as const;
export type Rating = (typeof RATINGS)[number];

export type CardPhase = 'new' | 'learning' | 'review' | 'relearning';

/** Scheduling state of one card. Times are epoch ms. */
export interface SrsState {
  phase: CardPhase;
  /** Index into learning/relearning steps; 0 otherwise. */
  step: number;
  ease: number;
  /** Current review interval in days (0 while never graduated). */
  intervalDays: number;
  dueAt: number;
  reps: number;
  lapses: number;
  lastReviewAt: number | null;
}

/**
 * Any scheduling algorithm (SM-2 today, FSRS later) implements this.
 * Implementations must be pure: same input, same output; never read the clock.
 */
export interface Scheduler {
  readonly name: string;
  initialState(now: number): SrsState;
  review(state: SrsState, rating: Rating, now: number): SrsState;
  preview(state: SrsState, now: number): Record<Rating, SrsState>;
}
