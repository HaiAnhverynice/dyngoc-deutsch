import { parseCsv } from './csv';
import { slugify } from './text';
import type { Word, WordContent } from './types';
import { validateWord, type ValidationIssue } from './validate';

export const CSV_COLUMNS = [
  'lemma',
  'article',
  'plural',
  'pos',
  'level',
  'vi',
  'en',
  'example_de',
  'example_vi',
  'example_en',
  'tags',
  'third_person',
  'preterite',
  'participle',
  'auxiliary',
] as const;
const REQUIRED_COLUMNS = ['lemma', 'pos', 'level', 'vi', 'en', 'example_de'] as const;

export interface ImportReport {
  added: Word[];
  duplicates: { line: number; lemma: string }[];
  errors: { line: number; issues: ValidationIssue[] }[];
}

/** Imported words sort after builtin content within a level. */
const IMPORT_SORT_BASE = 1_000_000;

/** Identity used for duplicate detection: same lemma + article + part of speech. */
export const wordKey = (w: Pick<WordContent, 'lemma' | 'article' | 'pos'>) =>
  `${w.lemma.trim().toLowerCase()}|${w.article ?? ''}|${w.pos}`;

/**
 * Shared pipeline for CSV and JSON. Only adds new words: existing words (and therefore
 * all study progress) are never modified.
 */
function collect(
  entries: { line: number; raw: unknown }[],
  existing: Word[],
  now: number,
): ImportReport {
  const report: ImportReport = { added: [], duplicates: [], errors: [] };
  const keys = new Set(existing.map(wordKey));
  const ids = new Set(existing.map((w) => w.id));
  let sort = IMPORT_SORT_BASE + existing.filter((w) => w.source === 'import').length;

  for (const { line, raw } of entries) {
    const r = validateWord(raw);
    if (!r.ok) {
      report.errors.push({ line, issues: r.issues });
      continue;
    }
    const key = wordKey(r.word);
    if (keys.has(key) || (r.word.id && ids.has(r.word.id))) {
      report.duplicates.push({ line, lemma: r.word.lemma });
      continue;
    }
    let id = r.word.id ?? `user.${r.word.level.toLowerCase()}.${slugify(r.word.lemma) || 'word'}`;
    for (let n = 2; ids.has(id); n++) id = `${id.replace(/-\d+$/, '')}-${n}`;
    keys.add(key);
    ids.add(id);
    report.added.push({
      ...r.word,
      id,
      source: 'import',
      sortIndex: sort++,
      updatedAt: now,
      deleted: false,
      userId: null,
    });
  }
  return report;
}

export function importCsv(text: string, existing: Word[], now: number): ImportReport {
  const rows = parseCsv(text);
  const header = rows[0];
  if (!header) return { added: [], duplicates: [], errors: [] };
  const cols = header.cells.map((c) => c.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((c) => !cols.includes(c));
  if (missing.length > 0) {
    return {
      added: [],
      duplicates: [],
      errors: [
        { line: header.line, issues: missing.map((field) => ({ code: 'required', field })) },
      ],
    };
  }

  const entries = rows.slice(1).map(({ line, cells }) => {
    const get = (name: (typeof CSV_COLUMNS)[number]) => {
      const i = cols.indexOf(name);
      return i >= 0 ? (cells[i] ?? '').trim() : '';
    };
    const hasVerb = ['third_person', 'preterite', 'participle', 'auxiliary'].some((c) =>
      get(c as (typeof CSV_COLUMNS)[number]),
    );
    return {
      line,
      raw: {
        lemma: get('lemma'),
        article: get('article'),
        plural: get('plural'),
        pos: get('pos'),
        level: get('level'),
        vi: get('vi'),
        en: get('en'),
        example: { de: get('example_de'), vi: get('example_vi'), en: get('example_en') },
        tags: get('tags')
          .split(';')
          .map((t) => t.trim())
          .filter(Boolean),
        ...(hasVerb
          ? {
              verb: {
                thirdPerson: get('third_person'),
                preterite: get('preterite'),
                participle: get('participle'),
                auxiliary: get('auxiliary'),
              },
            }
          : {}),
      },
    };
  });
  return collect(entries, existing, now);
}

/** Accepts `[word, …]` or `{ words: [word, …] }`. "line" = 1-based item index. */
export function importJson(text: string, existing: Word[], now: number): ImportReport {
  let data: unknown;
  try {
    data = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch {
    return {
      added: [],
      duplicates: [],
      errors: [{ line: 0, issues: [{ code: 'invalidType', field: 'json' }] }],
    };
  }
  const list = Array.isArray(data)
    ? data
    : typeof data === 'object' &&
        data !== null &&
        Array.isArray((data as { words?: unknown }).words)
      ? (data as { words: unknown[] }).words
      : null;
  if (!list) {
    return {
      added: [],
      duplicates: [],
      errors: [{ line: 0, issues: [{ code: 'invalidType', field: 'words' }] }],
    };
  }
  return collect(
    list.map((raw, i) => ({ line: i + 1, raw })),
    existing,
    now,
  );
}
