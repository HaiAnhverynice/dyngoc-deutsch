import { LEVELS } from '@/vocab/types';
import { GAP } from './types';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const bi = (v: unknown) => isObj(v) && str(v.vi) && str(v.en);

/** Returns a list of problems (empty = valid). Used by tests to guard hand-written content. */
export function validateGrammarFile(file: unknown): string[] {
  const errors: string[] = [];
  if (!isObj(file) || typeof file.version !== 'number' || !LEVELS.includes(file.level as never)) {
    return ['header'];
  }
  if (!Array.isArray(file.lessons)) return ['lessons'];
  const ids = new Set<string>();
  for (const [i, l] of (file.lessons as unknown[]).entries()) {
    const at = (m: string) =>
      errors.push(`lessons[${i}]${isObj(l) && str(l.id) ? ` ${String(l.id)}` : ''}: ${m}`);
    if (!isObj(l)) {
      at('not an object');
      continue;
    }
    if (!str(l.id) || !/^[a-z0-9]+\.[a-z0-9-]+$/.test(l.id as string)) at('id');
    if (ids.has(l.id as string)) at('duplicate id');
    ids.add(l.id as string);
    if (l.level !== file.level) at('level');
    if (!bi(l.title) || !bi(l.summary)) at('title/summary');
    if (!Array.isArray(l.blocks) || l.blocks.length === 0) at('blocks');
    for (const [j, b] of ((l.blocks as unknown[]) ?? []).entries()) {
      if (!isObj(b)) {
        at(`blocks[${j}]`);
      } else if (b.type === 'text' || b.type === 'tip') {
        if (!bi(b)) at(`blocks[${j}] text`);
      } else if (b.type === 'table') {
        const head = b.head as unknown[];
        const ok =
          Array.isArray(head) &&
          head.every((h) => typeof h === 'string') &&
          Array.isArray(b.rows) &&
          (b.rows as unknown[]).every(
            (r) =>
              Array.isArray(r) && r.length === head.length && r.every((c) => typeof c === 'string'),
          ) &&
          (b.caption === undefined || bi(b.caption));
        if (!ok) at(`blocks[${j}] table`);
      } else if (b.type === 'examples') {
        const ok =
          Array.isArray(b.items) &&
          (b.items as unknown[]).every((x) => isObj(x) && str(x.de) && str(x.vi) && str(x.en));
        if (!ok) at(`blocks[${j}] examples`);
      } else {
        at(`blocks[${j}] type`);
      }
    }
    const exIds = new Set<string>();
    if (!Array.isArray(l.exercises) || l.exercises.length === 0) at('exercises');
    for (const [j, e] of ((l.exercises as unknown[]) ?? []).entries()) {
      const ok =
        isObj(e) &&
        str(e.id) &&
        !exIds.has(e.id as string) &&
        str(e.de) &&
        (e.de as string).split(GAP).length === 2 &&
        Array.isArray(e.choices) &&
        e.choices.length >= 2 &&
        e.choices.every(str) &&
        new Set(e.choices).size === e.choices.length &&
        Number.isInteger(e.answer) &&
        (e.answer as number) >= 0 &&
        (e.answer as number) < e.choices.length &&
        bi(e.explain);
      if (!ok) at(`exercises[${j}]`);
      if (isObj(e) && str(e.id)) exIds.add(e.id as string);
    }
  }
  return errors;
}
