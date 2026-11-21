import { READING_FILE } from '@content/index';
import { LEVELS } from '@/vocab/types';
import { questionKey, readingProgress } from './progress';
import { validateReadingFile } from './validate';

const items = READING_FILE.items;

describe('reading content', () => {
  it('passes validation', () => {
    expect(validateReadingFile(READING_FILE)).toEqual([]);
  });

  it('covers every level with both dialogues and texts', () => {
    for (const level of LEVELS) expect(items.some((i) => i.level === level)).toBe(true);
    expect(items.some((i) => i.kind === 'dialogue')).toBe(true);
    expect(items.some((i) => i.kind === 'text')).toBe(true);
  });

  it('dialogues have at least two speakers', () => {
    for (const it of items.filter((i) => i.kind === 'dialogue')) {
      expect(new Set(it.lines.map((l) => l.speaker)).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('rejects broken content', () => {
    const it = items[0]!;
    const bad = (patch: object) =>
      validateReadingFile({ version: 1, items: [{ ...it, ...patch }] });
    expect(bad({})).toEqual([]);
    expect(bad({ id: 'b2.cafe' }).length).toBeGreaterThan(0); // prefix must match level
    expect(bad({ lines: [it.lines[0]] }).length).toBeGreaterThan(0);
    expect(bad({ lines: it.lines.map(({ speaker: _s, ...l }) => l) }).length).toBeGreaterThan(0);
    const q = it.questions[0]!;
    expect(bad({ questions: [{ ...q, answer: 5 }] }).length).toBeGreaterThan(0);
  });
});

describe('readingProgress', () => {
  it('marks an item complete once every question was answered correctly', () => {
    const it = items[0]!;
    const logs = it.questions.map((q) => ({
      type: 'reading' as const,
      wordId: questionKey(it.id, q.id),
      result: 'correct' as const,
      deleted: false,
    }));
    expect(readingProgress(items, logs.slice(1)).get(it.id)?.complete).toBe(false);
    expect(readingProgress(items, logs).get(it.id)?.complete).toBe(true);
    // Grammar logs with the same suffix must not count.
    expect(
      readingProgress(
        items,
        logs.map((l) => ({ ...l, type: 'grammar' as const })),
      ).get(it.id)?.passed,
    ).toBe(0);
  });
});
