import { countIntroducedToday, countToday, pickNext, type QueueCard } from './queue';

const MIN = 60_000;
const NOW = new Date(2026, 2, 10, 10).getTime();
const card = (id: string, phase: QueueCard['phase'], dueAt: number, createdAt = 0): QueueCard => ({
  id,
  wordId: `w.${id}`,
  phase,
  dueAt,
  createdAt,
});

describe('pickNext', () => {
  it('serves due learning before due review before new', () => {
    const cards = [
      card('rev', 'review', NOW - 1000),
      card('learn', 'learning', NOW - 10),
      card('new', 'new', NOW),
    ];
    expect(pickNext({ cards, unseenWordIds: [], now: NOW, newRemaining: 5 })).toMatchObject({
      card: { id: 'learn' },
    });
    const noLearn = cards.filter((c) => c.id !== 'learn');
    expect(
      pickNext({ cards: noLearn, unseenWordIds: [], now: NOW, newRemaining: 5 }),
    ).toMatchObject({ card: { id: 'rev' } });
  });

  it('orders review cards by due date (most overdue first)', () => {
    const cards = [card('b', 'review', NOW - 10), card('a', 'review', NOW - 100)];
    expect(pickNext({ cards, unseenWordIds: [], now: NOW, newRemaining: 0 })).toMatchObject({
      card: { id: 'a' },
    });
  });

  it('prefers explicitly added new cards, then unseen words', () => {
    const cards = [card('n2', 'new', NOW, 2), card('n1', 'new', NOW, 1)];
    expect(pickNext({ cards, unseenWordIds: ['x'], now: NOW, newRemaining: 1 })).toMatchObject({
      card: { id: 'n1' },
    });
    expect(pickNext({ cards: [], unseenWordIds: ['x', 'y'], now: NOW, newRemaining: 1 })).toEqual({
      type: 'newWord',
      wordId: 'x',
    });
  });

  it('respects the daily new limit', () => {
    expect(pickNext({ cards: [], unseenWordIds: ['x'], now: NOW, newRemaining: 0 })).toEqual({
      type: 'done',
      nextLearningAt: null,
    });
  });

  it('shows soon-due learning cards early only when nothing else is left', () => {
    const soon = card('soon', 'learning', NOW + 5 * MIN);
    expect(pickNext({ cards: [soon], unseenWordIds: ['x'], now: NOW, newRemaining: 1 })).toEqual({
      type: 'newWord',
      wordId: 'x',
    });
    expect(pickNext({ cards: [soon], unseenWordIds: [], now: NOW, newRemaining: 1 })).toMatchObject(
      {
        card: { id: 'soon' },
      },
    );
    const later = card('later', 'relearning', NOW + 60 * MIN);
    expect(pickNext({ cards: [later], unseenWordIds: [], now: NOW, newRemaining: 0 })).toEqual({
      type: 'done',
      nextLearningAt: NOW + 60 * MIN,
    });
  });

  it('ignores future review cards', () => {
    expect(
      pickNext({
        cards: [card('f', 'review', NOW + MIN)],
        unseenWordIds: [],
        now: NOW,
        newRemaining: 0,
      }),
    ).toEqual({ type: 'done', nextLearningAt: null });
  });
});

describe('countToday', () => {
  it('counts cards due before the next 04:00 and caps new cards', () => {
    const tomorrow4 = new Date(2026, 2, 11, 4).getTime();
    const cards = [
      card('a', 'review', NOW - 1),
      card('b', 'review', tomorrow4 - 1),
      card('c', 'review', tomorrow4),
      card('d', 'learning', NOW + 10 * MIN),
      card('e', 'new', NOW),
    ];
    expect(countToday(cards, 50, 3, 10, NOW)).toEqual({ dueToday: 3, newToday: 7 });
    expect(countToday(cards, 2, 3, 10, NOW)).toEqual({ dueToday: 3, newToday: 2 });
    expect(countToday(cards, 50, 12, 10, NOW)).toEqual({ dueToday: 3, newToday: 0 });
  });
});

describe('countIntroducedToday', () => {
  it('uses the 04:00 study-day boundary', () => {
    const logs = [
      { prevPhase: 'new' as const, reviewedAt: new Date(2026, 2, 10, 3, 59).getTime() },
      { prevPhase: 'new' as const, reviewedAt: new Date(2026, 2, 10, 4, 0).getTime() },
      { prevPhase: 'learning' as const, reviewedAt: new Date(2026, 2, 10, 9).getTime() },
    ];
    expect(countIntroducedToday(logs, NOW)).toBe(1);
  });
});
