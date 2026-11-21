import { LEVELS } from '@/vocab/types';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const tri = (v: unknown) => isObj(v) && str(v.de) && str(v.vi) && str(v.en);
const bi = (v: unknown) => isObj(v) && str(v.vi) && str(v.en);

/** Returns a list of problems (empty = valid). Guards hand-written reading content in tests. */
export function validateReadingFile(file: unknown): string[] {
  if (!isObj(file) || typeof file.version !== 'number' || !Array.isArray(file.items)) {
    return ['header'];
  }
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const [i, it] of (file.items as unknown[]).entries()) {
    const at = (m: string) =>
      errors.push(`items[${i}]${isObj(it) && str(it.id) ? ` ${String(it.id)}` : ''}: ${m}`);
    if (!isObj(it)) {
      at('not an object');
      continue;
    }
    if (!str(it.id) || !/^[a-z][0-9]\.[a-z0-9-]+$/.test(it.id as string)) at('id');
    if (ids.has(it.id as string)) at('duplicate id');
    ids.add(it.id as string);
    if (!LEVELS.includes(it.level as never)) at('level');
    if (str(it.id) && !(it.id as string).startsWith(String(it.level).toLowerCase() + '.')) {
      at('id prefix must match level');
    }
    if (it.kind !== 'dialogue' && it.kind !== 'text') at('kind');
    if (!bi(it.title) || !bi(it.intro)) at('title/intro');
    const lines = it.lines as unknown[];
    if (!Array.isArray(lines) || lines.length < 3) at('lines');
    for (const [j, l] of (lines ?? []).entries()) {
      if (!tri(l)) at(`lines[${j}]`);
      else if (it.kind === 'dialogue' && !str((l as Obj).speaker)) at(`lines[${j}] speaker`);
    }
    if (!Array.isArray(it.glossary) || !it.glossary.every(tri)) at('glossary');
    const qs = it.questions as unknown[];
    if (!Array.isArray(qs) || qs.length === 0) at('questions');
    const qIds = new Set<string>();
    for (const [j, q] of (qs ?? []).entries()) {
      const ok =
        tri(q) &&
        str((q as Obj).id) &&
        !qIds.has((q as Obj).id as string) &&
        Array.isArray((q as Obj).choices) &&
        ((q as Obj).choices as unknown[]).length >= 2 &&
        ((q as Obj).choices as unknown[]).every(str) &&
        new Set((q as Obj).choices as string[]).size === ((q as Obj).choices as unknown[]).length &&
        Number.isInteger((q as Obj).answer) &&
        ((q as Obj).answer as number) >= 0 &&
        ((q as Obj).answer as number) < ((q as Obj).choices as unknown[]).length &&
        bi((q as Obj).explain);
      if (!ok) at(`questions[${j}]`);
      if (isObj(q) && str(q.id)) qIds.add(q.id as string);
    }
  }
  return errors;
}
