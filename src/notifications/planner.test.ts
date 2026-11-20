import {
  formatNotification,
  hourlyMinutes,
  inMinuteRange,
  notificationTimes,
  planNotifications,
  prioritize,
  type NotificationCandidate,
} from './planner';
import { DEFAULT_NOTIFICATION_SETTINGS, type NotificationSettings } from './types';

const H = 60;
const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime();
const hm = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const settings = (o: Partial<NotificationSettings>): NotificationSettings => ({
  ...DEFAULT_NOTIFICATION_SETTINGS,
  enabled: true,
  quietEnabled: false,
  ...o,
});

const word = (id: string): NotificationCandidate['word'] => ({
  id,
  lemma: 'Tisch',
  article: 'der',
  vi: 'bàn',
  en: 'table',
  example: { de: 'Der Tisch ist groß.', vi: 'Cái bàn lớn.', en: 'The table is big.' },
});
const cand = (id: string, phase: NotificationCandidate['phase'], dueAt: number | null = null) => ({
  word: word(id),
  phase,
  dueAt,
});

describe('inMinuteRange', () => {
  it('handles normal, midnight-crossing and empty ranges', () => {
    expect(inMinuteRange(9 * H, 8 * H, 17 * H)).toBe(true);
    expect(inMinuteRange(17 * H, 8 * H, 17 * H)).toBe(false);
    expect(inMinuteRange(23 * H, 22 * H, 7 * H)).toBe(true);
    expect(inMinuteRange(3 * H, 22 * H, 7 * H)).toBe(true);
    expect(inMinuteRange(7 * H, 22 * H, 7 * H)).toBe(false);
    expect(inMinuteRange(12 * H, 22 * H, 7 * H)).toBe(false);
    expect(inMinuteRange(5, 5, 5)).toBe(false);
  });
});

describe('hourlyMinutes', () => {
  it('steps through the window inclusive of the end', () => {
    expect(
      hourlyMinutes(settings({ windowStart: 8 * H, windowEnd: 20 * H, everyHours: 4 })),
    ).toEqual([8 * H, 12 * H, 16 * H, 20 * H]);
  });

  it('wraps windows that cross midnight', () => {
    expect(
      hourlyMinutes(settings({ windowStart: 22 * H, windowEnd: 2 * H, everyHours: 2 })),
    ).toEqual([0, 2 * H, 22 * H]);
  });

  it('treats start == end as the whole day', () => {
    expect(hourlyMinutes(settings({ windowStart: 0, windowEnd: 0, everyHours: 6 }))).toEqual([
      0,
      6 * H,
      12 * H,
      18 * H,
    ]);
  });
});

describe('notificationTimes', () => {
  const now = at(2026, 3, 10, 13, 30);

  it('is empty when disabled', () => {
    expect(notificationTimes(settings({ enabled: false }), now)).toEqual([]);
  });

  it('skips times already past today and continues tomorrow', () => {
    const t = notificationTimes(settings({ mode: 'daily', dailyTimes: [8 * H, 19 * H] }), now, 3);
    expect(t.map(hm)).toEqual(['10 19:00', '11 08:00', '11 19:00']);
  });

  it('removes quiet hours that cross midnight', () => {
    const s = settings({
      windowStart: 0,
      windowEnd: 0,
      everyHours: 3,
      quietEnabled: true,
      quietStart: 22 * H,
      quietEnd: 7 * H,
    });
    expect(notificationTimes(s, now, 6).map(hm)).toEqual([
      '10 15:00',
      '10 18:00',
      '10 21:00',
      '11 09:00',
      '11 12:00',
      '11 15:00',
    ]);
  });

  it('removes quiet hours inside the day', () => {
    const s = settings({
      mode: 'daily',
      dailyTimes: [12 * H, 13 * H, 18 * H],
      quietEnabled: true,
      quietStart: 12 * H + 30,
      quietEnd: 14 * H,
    });
    expect(notificationTimes(s, at(2026, 3, 10, 6), 4).map(hm)).toEqual([
      '10 12:00',
      '10 18:00',
      '11 12:00',
      '11 18:00',
    ]);
  });

  it('caps at 60 and stays within the horizon', () => {
    const t = notificationTimes(settings({ windowStart: 0, windowEnd: 0, everyHours: 1 }), now);
    expect(t).toHaveLength(60);
    const few = notificationTimes(settings({ mode: 'daily', dailyTimes: [9 * H] }), now, 60, 5);
    expect(few).toHaveLength(5);
  });

  it('returns nothing when every slot is quiet', () => {
    const s = settings({
      mode: 'daily',
      dailyTimes: [23 * H],
      quietEnabled: true,
      quietStart: 22 * H,
      quietEnd: 7 * H,
    });
    expect(notificationTimes(s, now)).toEqual([]);
  });

  it('keeps wall-clock times across DST (29 Mar 2026, Berlin)', () => {
    const t = notificationTimes(
      settings({ mode: 'daily', dailyTimes: [9 * H] }),
      at(2026, 3, 28, 12),
      2,
    );
    expect(t.map(hm)).toEqual(['29 09:00', '30 09:00']);
  });
});

describe('prioritize & plan', () => {
  const now = at(2026, 3, 10, 7);

  it('orders learning > review (by due) > new > unseen and dedupes', () => {
    const order = prioritize([
      cand('unseen', null),
      cand('new', 'new', now),
      cand('rev-late', 'review', now + 1000),
      cand('rev-soon', 'review', now),
      cand('learn', 'relearning', now + 5),
      cand('learn', 'learning', now),
    ]).map((c) => c.word.id);
    expect(order).toEqual(['learn', 'rev-soon', 'rev-late', 'new', 'unseen']);
  });

  it('does not repeat a word until all are used', () => {
    const plan = planNotifications({
      settings: settings({ mode: 'daily', dailyTimes: [8 * H, 12 * H, 16 * H, 20 * H] }),
      lang: 'vi',
      candidates: [cand('a', 'review', now), cand('b', null), cand('c', 'learning', now)],
      now,
      max: 5,
    });
    expect(plan.map((p) => p.wordId)).toEqual(['c', 'a', 'b', 'c', 'a']);
  });

  it('plans nothing without words', () => {
    expect(planNotifications({ settings: settings({}), lang: 'vi', candidates: [], now })).toEqual(
      [],
    );
  });

  it('formats title and body per language', () => {
    expect(formatNotification(word('x'), 'vi')).toEqual({
      title: 'der Tisch · bàn',
      body: 'Der Tisch ist groß.\nCái bàn lớn.',
    });
    expect(formatNotification(word('x'), 'en').title).toBe('der Tisch · table');
    expect(formatNotification(word('x'), 'both')).toEqual({
      title: 'der Tisch · bàn / table',
      body: 'Der Tisch ist groß.\nCái bàn lớn.\nThe table is big.',
    });
    expect(formatNotification({ ...word('x'), article: null, lemma: 'gehen' }, 'vi').title).toBe(
      'gehen · bàn',
    );
  });
});
