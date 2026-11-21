import { GRAMMAR_FILES } from '@content/index';
import { exerciseKey, lessonProgress } from './progress';
import { GAP } from './types';
import { validateGrammarFile } from './validate';

const lessons = GRAMMAR_FILES.flatMap((f) => f.lessons);

describe('grammar content', () => {
  it('passes validation', () => {
    for (const f of GRAMMAR_FILES) expect(validateGrammarFile(f)).toEqual([]);
    expect(lessons.length).toBeGreaterThanOrEqual(10);
  });

  it('has globally unique lesson ids', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
  });

  it('every exercise has exactly one gap and the answer fills it', () => {
    for (const l of lessons) {
      for (const e of l.exercises) {
        expect(e.de.split(GAP)).toHaveLength(2);
        expect(e.choices[e.answer]).toBeDefined();
      }
    }
  });

  it('rejects broken content', () => {
    const lesson = lessons[0]!;
    const bad = (patch: object) =>
      validateGrammarFile({ version: 1, level: 'A1', lessons: [{ ...lesson, ...patch }] });
    expect(bad({})).toEqual([]);
    expect(bad({ id: 'Bad Id' }).length).toBeGreaterThan(0);
    expect(bad({ level: 'B1' }).length).toBeGreaterThan(0);
    const ex = lesson.exercises[0]!;
    expect(bad({ exercises: [{ ...ex, answer: 9 }] }).length).toBeGreaterThan(0);
    expect(bad({ exercises: [{ ...ex, de: 'no gap' }] }).length).toBeGreaterThan(0);
    expect(bad({ exercises: [{ ...ex, choices: ['a', 'a'] }] }).length).toBeGreaterThan(0);
    expect(bad({ blocks: [{ type: 'table', head: ['a', 'b'], rows: [['x']] }] }).length).toBe(1);
  });
});

describe('lessonProgress', () => {
  it('counts exercises passed at least once, ignoring wrong and deleted logs', () => {
    const l = lessons[0]!;
    const log = (exId: string, result: 'correct' | 'wrong', deleted = false) => ({
      type: 'grammar' as const,
      wordId: exerciseKey(l.id, exId),
      result,
      deleted,
    });
    const ids = l.exercises.map((e) => e.id);
    const p = lessonProgress(lessons, [
      log(ids[0]!, 'wrong'),
      log(ids[0]!, 'correct'),
      log(ids[1]!, 'wrong'),
      log(ids[2]!, 'correct', true),
    ]);
    expect(p.get(l.id)).toEqual({ passed: 1, total: ids.length, complete: false });
    const all = lessonProgress(
      lessons,
      ids.map((id) => log(id, 'correct')),
    );
    expect(all.get(l.id)?.complete).toBe(true);
    expect(all.get(lessons[1]!.id)?.passed).toBe(0);
  });
});
