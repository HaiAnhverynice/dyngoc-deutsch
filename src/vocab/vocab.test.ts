import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_FILES } from '@content/index';
import { createMemoryRepository } from '@/db/memoryRepository';
import { parseCsv } from './csv';
import { collectTags, filterWords, unseenWordIds } from './filter';
import { importCsv, importJson } from './import';
import { seedContent } from './seed';
import { fold, foldGerman, slugify } from './text';
import type { ContentFile, Word } from './types';
import { validateContentFile, validateWord } from './validate';

const NOW = new Date(2026, 2, 10, 10).getTime();
const EXAMPLES = path.join(__dirname, '../../content/examples');

const asWord = (w: ContentFile['words'][number], i = 0): Word => ({
  ...w,
  source: 'builtin',
  sortIndex: i,
  updatedAt: NOW,
  deleted: false,
  userId: null,
});
const a1 = CONTENT_FILES.find((f) => f.level === 'A1')!;
const builtin = CONTENT_FILES.flatMap((f) => f.words.map(asWord));

describe('bundled content', () => {
  it.each(CONTENT_FILES.map((f) => [f.level, f] as const))('%s is valid', (_level, file) => {
    expect(validateContentFile(file)).toEqual([]);
  });

  it('has ~150 A1 words and 10 per higher level', () => {
    expect(a1.words.length).toBeGreaterThanOrEqual(150);
    for (const lvl of ['A2', 'B1', 'B2']) {
      expect(CONTENT_FILES.find((f) => f.level === lvl)!.words).toHaveLength(10);
    }
  });

  it('ids are globally unique and follow de.<level>.<slug>', () => {
    const ids = builtin.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of builtin) expect(w.id.startsWith(`de.${w.level.toLowerCase()}.`)).toBe(true);
  });

  it('covers all genders, umlauts, ß and Vietnamese diacritics', () => {
    const text = JSON.stringify(CONTENT_FILES);
    for (const ch of ['Ä', 'Ö', 'Ü', 'ä', 'ö', 'ü', 'ß', 'ạ', 'ố', 'ư', 'đ']) {
      expect(text).toContain(ch);
    }
    for (const art of ['der', 'die', 'das']) {
      expect(a1.words.some((w) => w.article === art)).toBe(true);
    }
  });
});

describe('validateWord', () => {
  const base = {
    lemma: 'Haus',
    article: 'das',
    plural: 'Häuser',
    pos: 'noun',
    level: 'A1',
    vi: 'nhà',
    en: 'house',
    example: { de: 'Das Haus ist groß.', vi: 'Ngôi nhà lớn.', en: 'The house is big.' },
    tags: ['Home', 'home'],
  };

  it('accepts and normalises a valid noun', () => {
    const r = validateWord(base);
    expect(r.ok && r.word.tags).toEqual(['home']);
  });

  it('reports noun rules', () => {
    const r = validateWord({ ...base, article: 'den', lemma: 'haus' });
    expect(!r.ok && r.issues.map((i) => i.code)).toEqual(['nounNeedsArticle', 'nounCapital']);
  });

  it('rejects articles on non-nouns and bad enums', () => {
    const r = validateWord({ ...base, pos: 'verb', level: 'C3' });
    expect(!r.ok && r.issues.map((i) => i.code).sort()).toEqual([
      'articleOnlyNouns',
      'invalidLevel',
    ]);
    expect(validateWord({ ...base, pos: 'thing' }).ok).toBe(false);
  });

  it('checks verb forms and auxiliary', () => {
    const verb = { ...base, lemma: 'gehen', article: '', plural: '', pos: 'verb' };
    expect(
      validateWord({
        ...verb,
        verb: { thirdPerson: 'geht', preterite: 'ging', participle: 'gegangen', auxiliary: 'sein' },
      }).ok,
    ).toBe(true);
    expect(
      validateWord({
        ...verb,
        verb: {
          thirdPerson: 'geht',
          preterite: 'ging',
          participle: 'gegangen',
          auxiliary: 'werden',
        },
      }).ok,
    ).toBe(false);
  });

  it('treats "-" plural as none', () => {
    const r = validateWord({ ...base, lemma: 'Obst', plural: '-' });
    expect(r.ok && r.word.plural).toBeNull();
  });

  it('requires meanings and example', () => {
    const r = validateWord({ ...base, vi: ' ', example: {} });
    expect(!r.ok && r.issues.map((i) => i.field)).toEqual(['vi', 'example.de']);
  });
});

describe('parseCsv', () => {
  it('handles quotes, escaped quotes, embedded newlines, CRLF and BOM', () => {
    const rows = parseCsv('﻿a,b\r\n"x, y","he said ""hi"""\r\n\r\n"multi\nline",z\n');
    expect(rows).toEqual([
      { line: 1, cells: ['a', 'b'] },
      { line: 2, cells: ['x, y', 'he said "hi"'] },
      { line: 4, cells: ['multi\nline', 'z'] },
    ]);
  });

  it('keeps empty trailing cells', () => {
    expect(parseCsv('a,,\n')[0]!.cells).toEqual(['a', '', '']);
  });
});

describe('importCsv', () => {
  const header =
    'lemma,article,plural,pos,level,vi,en,example_de,example_vi,example_en,tags,third_person,preterite,participle,auxiliary';

  it('imports the example file', () => {
    const text = fs.readFileSync(path.join(EXAMPLES, 'import-example.csv'), 'utf8');
    const r = importCsv(text, builtin, NOW);
    expect(r.errors).toEqual([]);
    expect(r.duplicates).toEqual([]);
    expect(r.added.map((w) => w.id)).toEqual([
      'user.a1.broetchen',
      'user.a1.groesse',
      'user.a1.loeffel',
      'user.a1.laufen',
      'user.a2.froehlich',
    ]);
    expect(r.added[1]!.tags).toEqual(['clothes', 'shopping']);
    expect(r.added[3]!.verb).toEqual({
      thirdPerson: 'läuft',
      preterite: 'lief',
      participle: 'gelaufen',
      auxiliary: 'sein',
    });
    expect(r.added.every((w) => w.source === 'import')).toBe(true);
  });

  it('reports per-line errors and duplicates (existing and within file)', () => {
    const csv = [
      header,
      'Haus,das,Häuser,noun,A1,nhà,house,Das Haus.,,,,,,,',
      'Tisch,das,Tische,noun,A1,bàn,table,Der Tisch.,,,,,,,',
      'Katze,,Katzen,noun,A1,mèo,cat,Die Katze.,,,,,,,',
      'Vogel,der,Vögel,noun,A1,chim,bird,Der Vogel singt.,,,,,,,',
      'Vogel,der,Vögel,noun,A1,chim,bird,Der Vogel singt.,,,,,,,',
    ].join('\n');
    const r = importCsv(csv, builtin, NOW);
    // "das Tisch" is a different article from builtin "der Tisch", so it is not a duplicate.
    expect(r.added.map((w) => w.lemma)).toEqual(['Tisch', 'Vogel']);
    expect(r.duplicates).toEqual([
      { line: 2, lemma: 'Haus' },
      { line: 6, lemma: 'Vogel' },
    ]);
    expect(r.errors).toEqual([
      { line: 4, issues: [{ code: 'nounNeedsArticle', field: 'article' }] },
    ]);
  });

  it('rejects files missing required columns', () => {
    const r = importCsv('lemma,pos\nHaus,noun', [], NOW);
    expect(r.errors[0]!.line).toBe(1);
    expect(r.errors[0]!.issues.map((i) => i.field)).toEqual(['level', 'vi', 'en', 'example_de']);
  });

  it('makes ids unique', () => {
    const csv = [
      header,
      'Leiter,die,Leitern,noun,A2,cái thang,ladder,Die Leiter ist lang.,,,,,,,',
      'Leiter,der,Leiter,noun,A2,người lãnh đạo,leader,Der Leiter ist nett.,,,,,,,',
    ].join('\n');
    expect(importCsv(csv, [], NOW).added.map((w) => w.id)).toEqual([
      'user.a2.leiter',
      'user.a2.leiter-2',
    ]);
  });
});

describe('importJson', () => {
  it('imports the example file and keeps provided ids', () => {
    const text = fs.readFileSync(path.join(EXAMPLES, 'import-example.json'), 'utf8');
    const r = importJson(text, builtin, NOW);
    expect(r.errors).toEqual([]);
    expect(r.added.map((w) => w.id)).toEqual(['user.a2.bruecke', 'user.a1.schwimmen']);
  });

  it('treats an existing id as duplicate and reports malformed JSON', () => {
    const dup = JSON.stringify([{ ...a1.words[0] }]);
    expect(importJson(dup, builtin, NOW).duplicates).toHaveLength(1);
    expect(importJson('{oops', [], NOW).errors[0]!.issues[0]!.field).toBe('json');
    expect(importJson('{"x":1}', [], NOW).errors[0]!.issues[0]!.field).toBe('words');
  });
});

describe('text folding & filtering', () => {
  it('folds German and Vietnamese', () => {
    expect(fold('Häuser Straße bàn đường')).toBe('hauser strasse ban duong');
    expect(foldGerman('Größe')).toBe('groesse');
    expect(slugify('Entschuldigung!')).toBe('entschuldigung');
  });

  it('searches in all three languages, with or without diacritics', () => {
    const lemmas = (q: string) => filterWords(builtin, { query: q }).map((w) => w.lemma);
    expect(lemmas('hauser')).toContain('Haus');
    expect(lemmas('haeuser')).toContain('Haus');
    expect(lemmas('strasse')).toContain('Straße');
    expect(lemmas('ngôi nhà')).toContain('Haus');
    expect(lemmas('ngoi nha')).toContain('Haus');
    expect(lemmas('house')).toContain('Haus');
  });

  it('filters by level and tag', () => {
    const r = filterWords(builtin, { levels: ['B1'], tags: ['work'] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((w) => w.level === 'B1' && w.tags.includes('work'))).toBe(true);
    expect(collectTags(builtin)).toContain('food');
  });

  it('lists unseen words of active levels in teaching order', () => {
    const ids = unseenWordIds(builtin, ['A1'], new Set([a1.words[0]!.id]));
    expect(ids[0]).toBe(a1.words[1]!.id);
    expect(ids).toHaveLength(a1.words.length - 1);
  });
});

describe('seedContent', () => {
  const file = (version: number, words: ContentFile['words']): ContentFile => ({
    version,
    level: 'A1',
    words,
  });

  it('seeds once, re-seeds on version bump, and never loses progress', async () => {
    const repo = createMemoryRepository();
    const [w1, w2] = [a1.words[0]!, a1.words[1]!];
    expect(await seedContent(repo, [file(1, [w1, w2])], NOW)).toEqual(['vocab.a1']);
    expect(await seedContent(repo, [file(1, [w1, w2])], NOW)).toEqual([]);

    await repo.saveCard({
      id: 'c1',
      wordId: w1.id,
      kind: 'recognize',
      phase: 'review',
      step: 0,
      ease: 2.5,
      intervalDays: 5,
      dueAt: NOW,
      reps: 3,
      lapses: 0,
      lastReviewAt: NOW,
      createdAt: NOW,
      updatedAt: NOW,
      deleted: false,
      userId: null,
    });

    // v2: w1 text fixed and moved after a new word; w2 removed.
    const fixed = { ...w1, vi: 'đã sửa' };
    const added = { ...w2, id: 'de.a1.neu-x', lemma: 'Neu' };
    await seedContent(repo, [file(2, [added, fixed])], NOW + 1);

    expect((await repo.getWord(w1.id))!.vi).toBe('đã sửa');
    expect((await repo.getWord(w1.id))!.sortIndex).toBe(1);
    expect(await repo.getWord(w2.id)).toBeNull();
    expect((await repo.listWords({ includeDeleted: true })).some((w) => w.id === w2.id)).toBe(true);
    expect((await repo.getCardByWordId(w1.id))!.intervalDays).toBe(5);
  });

  it('does not touch imported words', async () => {
    const repo = createMemoryRepository();
    const imported = importCsv(
      fs.readFileSync(path.join(EXAMPLES, 'import-example.csv'), 'utf8'),
      [],
      NOW,
    ).added;
    await repo.upsertWords(imported);
    await seedContent(repo, CONTENT_FILES, NOW);
    expect((await repo.listWords()).filter((w) => w.source === 'import')).toHaveLength(
      imported.length,
    );
  });
});
