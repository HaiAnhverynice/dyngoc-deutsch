import { CONTENT_FILES } from '@content/index';
import type { Word, WordContent } from '@/vocab/types';
import {
  BLANK,
  buildQuiz,
  gradeOrder,
  gradeSpelling,
  makeCloze,
  makeQuestion,
  splitSentence,
} from './build';
import { seededRng, shuffle } from './random';
import { CHOICE_COUNT, QUIZ_TYPES, type Question } from './types';

const toWord = (c: WordContent, i: number): Word => ({
  ...c,
  source: 'builtin',
  sortIndex: i,
  updatedAt: 0,
  deleted: false,
  userId: null,
});
const ALL = CONTENT_FILES.flatMap((f) => f.words.map(toWord));
const byId = new Map(ALL.map((w) => [w.id, w]));
const get = (id: string) => byId.get(id)!;

const word = (over: Partial<Word>): Word => ({
  id: 'x',
  lemma: 'Tisch',
  article: 'der',
  plural: 'Tische',
  pos: 'noun',
  level: 'A1',
  vi: 'cái bàn',
  en: 'table',
  example: { de: 'Der Tisch ist neu.', vi: 'Cái bàn mới.', en: 'The table is new.' },
  tags: [],
  source: 'builtin',
  sortIndex: 0,
  updatedAt: 0,
  deleted: false,
  userId: null,
  ...over,
});

describe('random', () => {
  it('is deterministic per seed and shuffles without losing items', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], seededRng(7));
    expect(shuffle([1, 2, 3, 4, 5, 6], seededRng(7))).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
    const r = seededRng(1);
    for (let i = 0; i < 1000; i++) {
      const x = r();
      expect(x >= 0 && x < 1).toBe(true);
    }
  });
});

describe('sentence helpers', () => {
  it('blanks the lemma only at word boundaries, case-insensitively', () => {
    expect(makeCloze('Der Tisch ist neu.', 'Tisch')).toBe(`Der ${BLANK} ist neu.`);
    expect(makeCloze('Ich esse gern.', 'essen')).toBeNull();
    // "Haus" inside "Hause" must not match; the standalone one later does.
    expect(makeCloze('Zu Hause ist das Haus.', 'Haus')).toBe(`Zu Hause ist das ${BLANK}.`);
    expect(makeCloze('Guten Morgen, Anna!', 'guten Morgen')).toBe(`${BLANK}, Anna!`);
    expect(makeCloze('Die Straße ist lang.', 'Straße')).toBe(`Die ${BLANK} ist lang.`);
  });

  it('splits off final punctuation and keeps inner commas on tokens', () => {
    expect(splitSentence('Ja, ich komme heute.')).toEqual({
      tokens: ['Ja,', 'ich', 'komme', 'heute'],
      punctuation: '.',
    });
    expect(splitSentence('Wie geht es dir?')).toEqual({
      tokens: ['Wie', 'geht', 'es', 'dir'],
      punctuation: '?',
    });
    expect(splitSentence('Hallo')).toEqual({ tokens: ['Hallo'], punctuation: '' });
  });
});

describe('makeQuestion', () => {
  const rng = seededRng(42);

  it('builds 4 distinct meaning choices including the answer', () => {
    for (const w of ALL.slice(0, 60)) {
      const q = makeQuestion('meaning', w, ALL, rng);
      expect(q?.type).toBe('meaning');
      if (q?.type !== 'meaning') continue;
      expect(q.choiceIds).toHaveLength(CHOICE_COUNT);
      expect(q.choiceIds).toContain(w.id);
      const vis = q.choiceIds.map((id) => get(id).vi.toLowerCase());
      const ens = q.choiceIds.map((id) => get(id).en.toLowerCase());
      expect(new Set(vis).size).toBe(CHOICE_COUNT);
      expect(new Set(ens).size).toBe(CHOICE_COUNT);
    }
  });

  it('prefers distractors with the same part of speech', () => {
    const noun = get('de.a1.haus');
    const q = makeQuestion('meaning', noun, ALL, seededRng(3));
    expect(q?.type === 'meaning' && q.choiceIds.every((id) => get(id).pos === 'noun')).toBe(true);
  });

  it('gives listen choices that differ in written form', () => {
    const q = makeQuestion('listen', get('de.a1.haus'), ALL, rng);
    expect(q?.type).toBe('listen');
    if (q?.type !== 'listen') return;
    const forms = q.choiceIds.map((id) => get(id).lemma.toLowerCase());
    expect(new Set(forms).size).toBe(CHOICE_COUNT);
  });

  it('returns null when there are too few distinct distractors', () => {
    const a = word({ id: 'a' });
    const twins = [a, word({ id: 'b', lemma: 'Stuhl' }), word({ id: 'c', lemma: 'Bank' })];
    expect(makeQuestion('meaning', a, twins, rng)).toBeNull();
  });

  it('asks articles only for nouns', () => {
    expect(makeQuestion('article', word({}), [], rng)).toEqual({ type: 'article', wordId: 'x' });
    expect(
      makeQuestion('article', word({ pos: 'verb', article: null, lemma: 'gehen' }), [], rng),
    ).toBeNull();
  });

  it('shuffles order questions so they never start solved', () => {
    for (let seed = 0; seed < 50; seed++) {
      const q = makeQuestion('order', word({}), [], seededRng(seed));
      expect(q?.type).toBe('order');
      if (q?.type !== 'order') return;
      expect(q.solution).toEqual(['Der', 'Tisch', 'ist', 'neu']);
      expect(q.tokens).not.toEqual(q.solution);
      expect([...q.tokens].sort()).toEqual([...q.solution].sort());
    }
  });

  it('skips sentences that are too short or impossible to scramble', () => {
    const short = word({ example: { de: 'Hallo Anna!', vi: '', en: '' } });
    const same = word({ example: { de: 'ja ja ja ja.', vi: '', en: '' } });
    expect(makeQuestion('order', short, [], rng)).toBeNull();
    expect(makeQuestion('order', same, [], rng)).toBeNull();
  });
});

describe('buildQuiz', () => {
  it('produces the requested count with no repeated word and every chosen type', () => {
    const qs = buildQuiz({
      targets: ALL,
      all: ALL,
      types: QUIZ_TYPES,
      count: 20,
      rng: seededRng(9),
    });
    expect(qs).toHaveLength(20);
    expect(new Set(qs.map((q) => q.wordId)).size).toBe(20);
    expect(new Set(qs.map((q) => q.type))).toEqual(new Set(QUIZ_TYPES));
  });

  it('is deterministic for a seed', () => {
    const make = () =>
      buildQuiz({ targets: ALL, all: ALL, types: QUIZ_TYPES, count: 10, rng: seededRng(5) });
    expect(make()).toEqual(make());
  });

  it('respects target priority', () => {
    const first = [get('de.a1.haus'), get('de.a1.tisch')];
    const qs = buildQuiz({
      targets: [...first, ...ALL],
      all: ALL,
      types: ['article'],
      count: 2,
      rng: seededRng(1),
    });
    expect(qs.map((q) => q.wordId)).toEqual(['de.a1.haus', 'de.a1.tisch']);
  });

  it('drops types no word supports and stops when words run out', () => {
    const verbs = ALL.filter((w) => w.pos === 'verb').slice(0, 3);
    const qs: Question[] = buildQuiz({
      targets: verbs,
      all: ALL,
      types: ['article', 'spelling'],
      count: 10,
      rng: seededRng(2),
    });
    expect(qs).toHaveLength(3);
    expect(qs.every((q) => q.type === 'spelling')).toBe(true);
  });
});

describe('grading', () => {
  const tisch = { lemma: 'Tisch', article: 'der' as const };
  const strasse = { lemma: 'Straße', article: 'die' as const };
  const gehen = { lemma: 'gehen', article: null };

  it('accepts the exact word with or without the correct article', () => {
    expect(gradeSpelling(tisch, 'Tisch')).toBe('correct');
    expect(gradeSpelling(tisch, '  der   Tisch. ')).toBe('correct');
    expect(gradeSpelling(tisch, 'Der Tisch')).toBe('correct');
    expect(gradeSpelling(gehen, 'gehen')).toBe('correct');
  });

  it('treats case, umlaut and ß slips as close', () => {
    expect(gradeSpelling(tisch, 'tisch')).toBe('close');
    expect(gradeSpelling(strasse, 'Strasse')).toBe('close');
    expect(gradeSpelling({ lemma: 'Bäcker', article: 'der' }, 'Baecker')).toBe('close');
    expect(gradeSpelling({ lemma: 'Bäcker', article: 'der' }, 'Backer')).toBe('close');
  });

  it('rejects wrong words, wrong articles and empty input', () => {
    expect(gradeSpelling(tisch, 'die Tisch')).toBe('wrong');
    expect(gradeSpelling(tisch, 'Tasche')).toBe('wrong');
    expect(gradeSpelling(tisch, '   ')).toBe('wrong');
  });

  it('grades sentence order by exact token sequence', () => {
    expect(gradeOrder(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe('correct');
    expect(gradeOrder(['a', 'b', 'c'], ['b', 'a', 'c'])).toBe('wrong');
    expect(gradeOrder(['a', 'b', 'c'], ['a', 'b'])).toBe('wrong');
  });
});
