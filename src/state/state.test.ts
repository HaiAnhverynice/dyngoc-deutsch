import { CONTENT_FILES } from '@content/index';
import { createMemoryRepository } from '@/db/memoryRepository';
import { createSm2Scheduler } from '@/srs/sm2';
import { pickNext } from '@/srs/queue';
import { seedContent } from '@/vocab/seed';
import { DEFAULT_SETTINGS, parseSettings, serializeSettings } from './settings';
import { addToStudy, answerCard, loadStudySnapshot, newCard } from './study';

const NOW = new Date(2026, 2, 10, 10).getTime();
const MIN = 60_000;
const scheduler = createSm2Scheduler();
let n = 0;
const makeId = () => `id-${++n}`;

describe('settings', () => {
  it('round-trips and falls back on garbage', () => {
    const s = { ...DEFAULT_SETTINGS, uiLang: 'both' as const, levels: ['A1', 'B1'] as const };
    expect(parseSettings(serializeSettings({ ...s, levels: [...s.levels] }))).toEqual({
      ...s,
      levels: ['A1', 'B1'],
    });
    expect(
      parseSettings({ uiLang: '"fr"', levels: '[]', newPerDay: '999', notifications: '{bad' }),
    ).toEqual(DEFAULT_SETTINGS);
  });

  it('sanitises notification times', () => {
    const p = parseSettings({
      notifications: JSON.stringify({ dailyTimes: [600, 600, 2000, 60], everyHours: 50 }),
    });
    expect(p.notifications.dailyTimes).toEqual([60, 600]);
    expect(p.notifications.everyHours).toBe(DEFAULT_SETTINGS.notifications.everyHours);
  });
});

describe('study flow', () => {
  it('introduces new words up to the daily limit and keeps progress', async () => {
    const repo = createMemoryRepository();
    await seedContent(repo, CONTENT_FILES, NOW);
    const settings = { ...DEFAULT_SETTINGS, newPerDay: 2 };

    let snap = await loadStudySnapshot(repo, settings, NOW);
    expect(snap).toMatchObject({ dueToday: 0, newToday: 2, learned: 0 });

    // Simulate a session: answer Good on every card shown until done.
    let t = NOW;
    for (let i = 0; i < 20; i++) {
      snap = await loadStudySnapshot(repo, settings, t);
      const next = pickNext({
        cards: snap.cards,
        unseenWordIds: snap.unseen,
        now: t,
        newRemaining: snap.newToday,
      });
      if (next.type === 'done') break;
      const card = next.type === 'card' ? next.card : newCard(next.wordId, scheduler, t, makeId());
      await answerCard(repo, scheduler, card, 'good', t, 1000, makeId);
      t += 11 * MIN;
    }

    snap = await loadStudySnapshot(repo, settings, t);
    expect(snap).toMatchObject({ newToday: 0, learned: 2, introducedToday: 2 });
    expect(snap.cards.every((c) => c.phase === 'review' && c.intervalDays === 1)).toBe(true);
    expect(await repo.listReviewLogs()).toHaveLength(4);

    // Next study day: both due, two more new allowed.
    const tomorrow = new Date(2026, 2, 11, 9).getTime();
    expect(await loadStudySnapshot(repo, settings, tomorrow)).toMatchObject({
      dueToday: 2,
      newToday: 2,
      introducedToday: 0,
    });
  });

  it('addToStudy is idempotent and the card is served before unseen words', async () => {
    const repo = createMemoryRepository();
    await seedContent(repo, CONTENT_FILES, NOW);
    const target = 'de.b2.nachhaltig';
    const a = await addToStudy(repo, scheduler, target, NOW, makeId);
    const b = await addToStudy(repo, scheduler, target, NOW, makeId);
    expect(a.id).toBe(b.id);
    const snap = await loadStudySnapshot(repo, DEFAULT_SETTINGS, NOW);
    expect(
      pickNext({ cards: snap.cards, unseenWordIds: snap.unseen, now: NOW, newRemaining: 1 }),
    ).toMatchObject({ type: 'card', card: { wordId: target } });
  });
});
