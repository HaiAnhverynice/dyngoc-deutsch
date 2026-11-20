import { createSm2Scheduler, DEFAULT_SM2_CONFIG } from './sm2';
import { describeInterval } from './format';
import type { SrsState } from './types';

const MIN = 60_000;
const at = (y: number, m: number, d: number, h = 10, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime();
const NOW = at(2026, 3, 10, 10);

const s = createSm2Scheduler();

const reviewCard = (over: Partial<SrsState> = {}): SrsState => ({
  phase: 'review',
  step: 0,
  ease: 2.5,
  intervalDays: 10,
  dueAt: at(2026, 3, 10, 4),
  reps: 5,
  lapses: 0,
  lastReviewAt: at(2026, 2, 28),
  ...over,
});

describe('timezone setup', () => {
  it('runs in Europe/Berlin so DST cases are meaningful', () => {
    expect(process.env.TZ).toBe('Europe/Berlin');
  });
});

describe('new cards / learning steps', () => {
  const fresh = s.initialState(NOW);

  it('creates a new card due now with starting ease', () => {
    expect(fresh).toEqual({
      phase: 'new',
      step: 0,
      ease: 2.5,
      intervalDays: 0,
      dueAt: NOW,
      reps: 0,
      lapses: 0,
      lastReviewAt: null,
    });
  });

  it('Again → first step (1 min)', () => {
    const r = s.review(fresh, 'again', NOW);
    expect(r).toMatchObject({ phase: 'learning', step: 0, dueAt: NOW + 1 * MIN, reps: 1 });
    expect(r.lastReviewAt).toBe(NOW);
  });

  it('Hard on first step → halfway between steps 1 and 2', () => {
    expect(s.review(fresh, 'hard', NOW)).toMatchObject({ step: 0, dueAt: NOW + 5.5 * MIN });
  });

  it('Hard on a later step repeats that step', () => {
    const step1 = s.review(fresh, 'good', NOW);
    expect(s.review(step1, 'hard', NOW)).toMatchObject({ step: 1, dueAt: NOW + 10 * MIN });
  });

  it('Good walks the steps, then graduates to a 1-day review due at day start', () => {
    const step1 = s.review(fresh, 'good', NOW);
    expect(step1).toMatchObject({ phase: 'learning', step: 1, dueAt: NOW + 10 * MIN });
    const grad = s.review(step1, 'good', NOW + 10 * MIN);
    expect(grad).toMatchObject({ phase: 'review', intervalDays: 1, ease: 2.5, reps: 2 });
    expect(grad.dueAt).toBe(at(2026, 3, 11, 4));
  });

  it('Easy graduates immediately with the easy interval', () => {
    const r = s.review(fresh, 'easy', NOW);
    expect(r).toMatchObject({ phase: 'review', intervalDays: 4 });
    expect(r.dueAt).toBe(at(2026, 3, 14, 4));
  });

  it('Again during learning restarts at step 0', () => {
    const step1 = s.review(fresh, 'good', NOW);
    expect(s.review(step1, 'again', NOW)).toMatchObject({ step: 0, dueAt: NOW + MIN });
  });

  it('does not change ease while learning', () => {
    let st = fresh;
    for (const r of ['again', 'hard', 'good', 'good'] as const) st = s.review(st, r, NOW);
    expect(st.ease).toBe(2.5);
  });
});

describe('review cards', () => {
  it('Hard / Good / Easy on time', () => {
    const c = reviewCard();
    expect(s.review(c, 'hard', NOW)).toMatchObject({ intervalDays: 12, ease: 2.35 });
    expect(s.review(c, 'good', NOW)).toMatchObject({ intervalDays: 25, ease: 2.5 });
    expect(s.review(c, 'easy', NOW)).toMatchObject({ intervalDays: 33, ease: 2.65 });
    expect(s.review(c, 'good', NOW).dueAt).toBe(at(2026, 4, 4, 4));
  });

  it('keeps Hard < Good < Easy even for tiny intervals', () => {
    const c = reviewCard({ intervalDays: 1, ease: 1.3 });
    const p = s.preview(c, NOW);
    expect([p.hard.intervalDays, p.good.intervalDays, p.easy.intervalDays]).toEqual([2, 3, 4]);
  });

  it('clamps ease to [minEase, maxEase]', () => {
    expect(s.review(reviewCard({ ease: 1.3 }), 'again', NOW).ease).toBe(1.3);
    expect(s.review(reviewCard({ ease: 1.4 }), 'hard', NOW).ease).toBe(1.3);
    expect(s.review(reviewCard({ ease: 3.5 }), 'easy', NOW).ease).toBe(3.5);
    expect(s.review(reviewCard({ ease: 3.4 }), 'easy', NOW).ease).toBe(3.5);
  });

  it('clamps to maxIntervalDays', () => {
    const big = createSm2Scheduler({ maxIntervalDays: 100 });
    expect(big.review(reviewCard({ intervalDays: 90 }), 'easy', NOW).intervalDays).toBe(100);
  });

  it('rewards overdue answers proportionally', () => {
    const late = reviewCard({ dueAt: at(2026, 3, 4, 4) }); // 6 days late
    expect(s.review(late, 'hard', NOW).intervalDays).toBe(14); // (10 + 1.5) × 1.2
    expect(s.review(late, 'good', NOW).intervalDays).toBe(33); // (10 + 3) × 2.5
    expect(s.review(late, 'easy', NOW).intervalDays).toBe(52); // (10 + 6) × 2.5 × 1.3
  });

  it('treats a card reviewed early as not overdue', () => {
    const early = reviewCard({ dueAt: at(2026, 3, 20, 4) });
    expect(s.review(early, 'good', NOW).intervalDays).toBe(25);
  });
});

describe('lapses / relearning', () => {
  const lapsed = s.review(reviewCard({ intervalDays: 20, lapses: 1 }), 'again', NOW);

  it('Again on a review card starts relearning', () => {
    expect(lapsed).toMatchObject({
      phase: 'relearning',
      step: 0,
      lapses: 2,
      ease: 2.3,
      intervalDays: 1,
      dueAt: NOW + 10 * MIN,
    });
  });

  it('Good after relearning returns to review with the lapse interval', () => {
    const back = s.review(lapsed, 'good', NOW + 10 * MIN);
    expect(back).toMatchObject({ phase: 'review', intervalDays: 1, lapses: 2, ease: 2.3 });
    expect(back.dueAt).toBe(at(2026, 3, 11, 4));
  });

  it('Easy after relearning adds a day', () => {
    expect(s.review(lapsed, 'easy', NOW).intervalDays).toBe(2);
  });

  it('Again while relearning stays in relearning without another lapse', () => {
    expect(s.review(lapsed, 'again', NOW)).toMatchObject({ phase: 'relearning', lapses: 2 });
  });

  it('honours lapseIntervalFactor', () => {
    const keepHalf = createSm2Scheduler({ lapseIntervalFactor: 0.5 });
    expect(keepHalf.review(reviewCard({ intervalDays: 20 }), 'again', NOW).intervalDays).toBe(10);
  });
});

describe('day boundaries (local time, day starts 04:00)', () => {
  it('a review at 02:00 belongs to the previous study day', () => {
    const night = at(2026, 3, 11, 2);
    const grad = s.review(s.review(s.initialState(night), 'good', night), 'good', night);
    expect(grad.dueAt).toBe(at(2026, 3, 11, 4));
  });

  it('a review at 04:00 belongs to the new study day', () => {
    const morning = at(2026, 3, 11, 4);
    expect(s.review(s.initialState(morning), 'easy', morning).dueAt).toBe(at(2026, 3, 15, 4));
  });

  it('keeps 04:00 local across the DST switch (29 Mar 2026 in Berlin)', () => {
    const before = at(2026, 3, 28, 10);
    const due = new Date(s.review(s.initialState(before), 'easy', before).dueAt);
    expect([due.getDate(), due.getHours()]).toEqual([1, 4]);
    expect(due.getMonth()).toBe(3);
  });

  it('counts overdue days by calendar, not 24h blocks', () => {
    const c = reviewCard({ dueAt: at(2026, 3, 9, 4) });
    expect(s.review(c, 'good', at(2026, 3, 10, 3, 59)).intervalDays).toBe(25);
    expect(s.review(c, 'good', at(2026, 3, 10, 4, 0)).intervalDays).toBe(26); // (10+0.5)×2.5
  });
});

describe('purity', () => {
  it('never reads the clock and does not mutate input', () => {
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('Date.now called');
    });
    const c = reviewCard();
    const frozen = JSON.stringify(c);
    const a = s.preview(c, NOW);
    const b = s.preview(c, NOW);
    expect(a).toEqual(b);
    expect(JSON.stringify(c)).toBe(frozen);
    spy.mockRestore();
  });

  it('preview equals individual reviews', () => {
    const c = reviewCard();
    const p = s.preview(c, NOW);
    expect(p.good).toEqual(s.review(c, 'good', NOW));
    expect(p.again).toEqual(s.review(c, 'again', NOW));
  });

  it('rejects empty step lists', () => {
    expect(() => createSm2Scheduler({ learningStepsMin: [] })).toThrow();
  });

  it('exposes sane defaults', () => {
    expect(DEFAULT_SM2_CONFIG.minEase).toBe(1.3);
  });
});

describe('describeInterval', () => {
  it('formats minutes, hours, days, months, years', () => {
    const base = reviewCard();
    expect(describeInterval({ ...base, phase: 'learning', dueAt: NOW + 10 * MIN }, NOW)).toEqual({
      value: 10,
      unit: 'minute',
    });
    expect(describeInterval({ ...base, phase: 'learning', dueAt: NOW + 90 * MIN }, NOW)).toEqual({
      value: 1.5,
      unit: 'hour',
    });
    expect(describeInterval({ ...base, intervalDays: 3 }, NOW)).toEqual({ value: 3, unit: 'day' });
    expect(describeInterval({ ...base, intervalDays: 45 }, NOW)).toEqual({
      value: 1.5,
      unit: 'month',
    });
    expect(describeInterval({ ...base, intervalDays: 730 }, NOW)).toEqual({
      value: 2,
      unit: 'year',
    });
  });
});
