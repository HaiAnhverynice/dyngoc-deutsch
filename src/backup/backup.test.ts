import { createMemoryRepository } from '@/db/memoryRepository';
import type { Card, ReviewLog } from '@/db/types';
import { importCsv } from '@/vocab/import';
import { BACKUP_FORMAT, backupFileName, createBackup, parseBackup } from './format';

const NOW = new Date(2026, 2, 10, 10, 5).getTime();

const card: Card = {
  id: '6f1c1f1e-0000-4000-8000-000000000001',
  wordId: 'de.a1.haus',
  kind: 'recognize',
  phase: 'review',
  step: 0,
  ease: 2.5,
  intervalDays: 4,
  dueAt: NOW,
  reps: 3,
  lapses: 1,
  lastReviewAt: NOW - 1000,
  createdAt: NOW - 5000,
  updatedAt: NOW,
  deleted: false,
  userId: null,
};
const log: ReviewLog = {
  id: '6f1c1f1e-0000-4000-8000-000000000002',
  cardId: card.id,
  wordId: card.wordId,
  rating: 'good',
  prevPhase: 'learning',
  nextPhase: 'review',
  prevIntervalDays: 0,
  nextIntervalDays: 1,
  ease: 2.5,
  reviewedAt: NOW - 1000,
  durationMs: 4200,
  updatedAt: NOW,
  deleted: false,
  userId: null,
};
const header =
  'lemma,article,plural,pos,level,vi,en,example_de,example_vi,example_en,tags\nVogel,der,Vögel,noun,A1,chim,bird,Der Vogel singt.,Con chim hót.,The bird sings.,animals';

describe('backup', () => {
  it('round-trips through a repository and replaces existing data', async () => {
    const src = createMemoryRepository();
    const imported = importCsv(header, [], NOW).added;
    await src.upsertWords(imported);
    await src.saveReview(card, log);
    await src.setSettings({ uiLang: '"en"' }, NOW);

    const json = JSON.stringify(createBackup(await src.exportUserData(), NOW, 1));
    const parsed = parseBackup(json);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const dst = createMemoryRepository();
    await dst.saveCard({ ...card, id: 'other', wordId: 'de.a1.tisch' });
    await dst.replaceUserData(parsed.backup);

    expect(await dst.listCards()).toEqual([card]);
    expect(await dst.listReviewLogs()).toEqual([log]);
    expect(await dst.getSettings()).toEqual({ uiLang: '"en"' });
    expect((await dst.listWords()).map((w) => w.lemma)).toEqual(['Vogel']);
  });

  it('rejects invalid files with a reason', () => {
    const ok = createBackup(
      { settings: {}, cards: [card], reviewLogs: [log], importedWords: [] },
      NOW,
      1,
    );
    const reason = (v: unknown) => {
      const r = parseBackup(typeof v === 'string' ? v : JSON.stringify(v));
      return r.ok ? null : r.reason;
    };
    expect(reason('nope')).toBe('JSON');
    expect(reason({ ...ok, format: 'x' })).toBe('format');
    expect(reason({ ...ok, formatVersion: 99 })).toBe('formatVersion 99');
    expect(reason({ ...ok, cards: [{ ...card, phase: 'weird' }] })).toBe('cards[0]');
    expect(reason({ ...ok, reviewLogs: [{ ...log, rating: 'meh' }] })).toBe('reviewLogs[0]');
    expect(reason({ ...ok, settings: { a: 1 } })).toBe('settings');
    expect(reason({ ...ok, importedWords: [{ lemma: 'x' }] })).toBe('importedWords[0]');
    expect(reason(ok)).toBeNull();
    expect(ok.format).toBe(BACKUP_FORMAT);
  });

  it('names files by local time', () => {
    expect(backupFileName(NOW)).toBe('dyngoc-backup-20260310-1005.json');
  });
});
