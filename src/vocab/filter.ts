import { fold, foldGerman } from './text';
import { LEVELS, type Level, type Word } from './types';

export interface WordFilter {
  query?: string;
  levels?: Level[];
  tags?: string[];
}

const levelRank = (l: Level) => LEVELS.indexOf(l);
export const compareWords = (a: Word, b: Word) =>
  levelRank(a.level) - levelRank(b.level) || a.sortIndex - b.sortIndex;

/** Matches German (with or without umlauts), Vietnamese (with or without tones) and English. */
export function filterWords(words: Word[], f: WordFilter): Word[] {
  const q = f.query?.trim() ?? '';
  const qa = fold(q);
  const qg = foldGerman(q);
  return words
    .filter((w) => {
      if (f.levels?.length && !f.levels.includes(w.level)) return false;
      if (f.tags?.length && !f.tags.some((t) => w.tags.includes(t))) return false;
      if (!q) return true;
      const de = `${w.article ?? ''} ${w.lemma} ${w.plural ?? ''}`;
      return (
        fold(de).includes(qa) ||
        foldGerman(de).includes(qg) ||
        fold(w.vi).includes(qa) ||
        fold(w.en).includes(qa)
      );
    })
    .sort(compareWords);
}

export function collectTags(words: Word[]): string[] {
  return [...new Set(words.flatMap((w) => w.tags))].sort();
}

/** Words of the active levels without a card, in teaching order. */
export function unseenWordIds(words: Word[], levels: Level[], cardWordIds: Set<string>): string[] {
  return words
    .filter((w) => !w.deleted && levels.includes(w.level) && !cardWordIds.has(w.id))
    .sort(compareWords)
    .map((w) => w.id);
}
