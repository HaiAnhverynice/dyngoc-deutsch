import { fold, foldGerman } from '@/vocab/text';
import type { Word } from '@/vocab/types';
import { shuffle, type Rng } from './random';
import { CHOICE_COUNT, type Question, type QuizResult, type QuizType } from './types';

export const ORDER_MIN_TOKENS = 3;
export const ORDER_MAX_TOKENS = 10;
export const BLANK = '_____';

const spoken = (w: Pick<Word, 'article' | 'lemma'>) =>
  w.article ? `${w.article} ${w.lemma}` : w.lemma;
const isLetter = (ch: string | undefined) => !!ch && ch.toLowerCase() !== ch.toUpperCase();

/** Example sentence with the lemma blanked out, or null if the lemma isn't there verbatim. */
export function makeCloze(sentence: string, lemma: string): string | null {
  const hay = sentence.toLowerCase();
  const needle = lemma.toLowerCase();
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const end = i + needle.length;
    if (!isLetter(sentence[i - 1]) && !isLetter(sentence[end])) {
      return sentence.slice(0, i) + BLANK + sentence.slice(end);
    }
  }
  return null;
}

/** "Ich wohne in Berlin." → tokens [Ich, wohne, in, Berlin] + "." */
export function splitSentence(sentence: string): { tokens: string[]; punctuation: string } {
  const trimmed = sentence.trim();
  const punctuation = /[.!?…]+$/.exec(trimmed)?.[0] ?? '';
  const body = trimmed.slice(0, trimmed.length - punctuation.length).trim();
  return { tokens: body ? body.split(/\s+/) : [], punctuation };
}

const sameSequence = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * Picks `n` distractors sharing no key with the target or with each other.
 * Prefers the same part of speech and level so wrong answers are plausible.
 */
function pickDistractors(
  target: Word,
  all: readonly Word[],
  keys: (w: Word) => string[],
  n: number,
  rng: Rng,
): Word[] | null {
  const others = all.filter((w) => w.id !== target.id && !w.deleted);
  const tiers = [
    others.filter((w) => w.pos === target.pos && w.level === target.level),
    others.filter((w) => w.pos === target.pos && w.level !== target.level),
    others.filter((w) => w.pos !== target.pos),
  ];
  const seen = new Set(keys(target));
  const picked: Word[] = [];
  for (const tier of tiers) {
    for (const w of shuffle(tier, rng)) {
      const ks = keys(w);
      if (ks.some((k) => seen.has(k))) continue;
      for (const k of ks) seen.add(k);
      picked.push(w);
      if (picked.length === n) return picked;
    }
  }
  return null;
}

// Two choices must never share a meaning (in either language) or sound alike on paper.
const meaningKeys = (w: Word) => [`vi:${fold(w.vi)}`, `en:${fold(w.en)}`];
const spokenKeys = (w: Word) => [fold(spoken(w))];

/** One question of `type` about `word`, or null if the word can't support that type. */
export function makeQuestion(
  type: QuizType,
  word: Word,
  all: readonly Word[],
  rng: Rng,
): Question | null {
  switch (type) {
    case 'meaning': {
      const d = pickDistractors(word, all, meaningKeys, CHOICE_COUNT - 1, rng);
      if (!d) return null;
      return { type, wordId: word.id, choiceIds: shuffle([word, ...d], rng).map((w) => w.id) };
    }
    case 'listen': {
      const d = pickDistractors(word, all, spokenKeys, CHOICE_COUNT - 1, rng);
      if (!d) return null;
      return { type, wordId: word.id, choiceIds: shuffle([word, ...d], rng).map((w) => w.id) };
    }
    case 'article':
      return word.pos === 'noun' && word.article ? { type, wordId: word.id } : null;
    case 'spelling':
      return word.lemma.length >= 2
        ? { type, wordId: word.id, cloze: makeCloze(word.example.de, word.lemma) }
        : null;
    case 'order': {
      const { tokens, punctuation } = splitSentence(word.example.de);
      if (tokens.length < ORDER_MIN_TOKENS || tokens.length > ORDER_MAX_TOKENS) return null;
      let shuffled = shuffle(tokens, rng);
      for (let i = 0; i < 8 && sameSequence(shuffled, tokens); i++) shuffled = shuffle(tokens, rng);
      if (sameSequence(shuffled, tokens)) return null; // e.g. all tokens identical
      return { type, wordId: word.id, tokens: shuffled, solution: tokens, punctuation };
    }
  }
}

export interface BuildInput {
  /** Candidate words in priority order (e.g. studied words first). */
  targets: readonly Word[];
  /** Distractor source; usually every word of the selected levels. */
  all: readonly Word[];
  types: readonly QuizType[];
  count: number;
  rng: Rng;
}

/**
 * Builds a session that rotates through the chosen types in shuffled rounds and never
 * asks about the same word twice. Types no remaining word supports are dropped.
 */
export function buildQuiz({ targets, all, types, count, rng }: BuildInput): Question[] {
  const used = new Set<string>();
  const out: Question[] = [];
  let live = [...new Set(types)];
  let round: QuizType[] = [];

  while (out.length < count && live.length > 0) {
    if (round.length === 0) round = shuffle(live, rng);
    const type = round.shift()!;
    let q: Question | null = null;
    for (const w of targets) {
      if (used.has(w.id)) continue;
      q = makeQuestion(type, w, all, rng);
      if (q) break;
    }
    if (q) {
      out.push(q);
      used.add(q.wordId);
    } else {
      live = live.filter((t) => t !== type);
      round = round.filter((t) => t !== type);
    }
  }
  return out;
}

/** Accepts the word with or without its article; a wrong article is wrong. */
export function gradeSpelling(word: Pick<Word, 'lemma' | 'article'>, input: string): QuizResult {
  let s = input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '');
  if (!s) return 'wrong';
  if (word.article) {
    const m = /^(der|die|das) (.+)$/i.exec(s);
    if (m) {
      if (m[1]!.toLowerCase() !== word.article) return 'wrong';
      s = m[2]!;
    }
  }
  if (s === word.lemma) return 'correct';
  if (fold(s) === fold(word.lemma) || foldGerman(s) === foldGerman(word.lemma)) return 'close';
  return 'wrong';
}

export const gradeOrder = (solution: readonly string[], built: readonly string[]): QuizResult =>
  sameSequence(solution, built) ? 'correct' : 'wrong';

export const gradeChoice = (answerId: string, chosenId: string): QuizResult =>
  answerId === chosenId ? 'correct' : 'wrong';

export const isPass = (r: QuizResult) => r !== 'wrong';
