import type { VerbForms } from '@/vocab/types';

/**
 * German verb conjugation derived from the four forms stored with every verb
 * (infinitive, 3rd person present, Präteritum, Partizip II + auxiliary). Pure.
 *
 * Covers: regular verbs, vowel changes (a→ä, e→i/ie) taken from the 3rd person,
 * e-insertion (arbeitest, öffnet), s-stems (heißt), -eln/-ern verbs, modal-like
 * verbs (kann/weiß), separable verbs (steht auf) and the truly irregular sein,
 * haben, werden, tun.
 */
export const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'] as const;
export type Six = [string, string, string, string, string, string];

export interface Conjugation {
  present: Six;
  preterite: Six;
  perfect: Six;
  future: Six;
  /** du, ihr, Sie; null for modal verbs, which have no imperative. "(e)" marks an optional -e. */
  imperative: [string, string, string] | null;
  /** Indices of present forms that differ from the regular pattern. */
  irregularPresent: number[];
  separablePrefix: string | null;
}

const PRESENT_OVERRIDES: Record<string, Six> = {
  sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'],
  haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
  werden: ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'],
  tun: ['tue', 'tust', 'tut', 'tun', 'tut', 'tun'],
};
const IMPERATIVE_OVERRIDES: Record<string, [string, string, string]> = {
  sein: ['sei', 'seid', 'seien Sie'],
  haben: ['hab', 'habt', 'haben Sie'],
  werden: ['werde', 'werdet', 'werden Sie'],
  tun: ['tu', 'tut', 'tun Sie'],
  wissen: ['wisse', 'wisst', 'wissen Sie'],
};
const MODALS = new Set(['können', 'müssen', 'dürfen', 'wollen', 'sollen', 'mögen']);

const endsWithAny = (s: string, ends: string[]) => ends.some((e) => s.endsWith(e));

interface Stem {
  stem: string;
  /** Plural/infinitive ending: 'en' normally, 'n' for -eln/-ern and similar. */
  pluralEnding: 'en' | 'n';
}

function splitInfinitive(inf: string): Stem {
  if (inf.endsWith('en')) return { stem: inf.slice(0, -2), pluralEnding: 'en' };
  return { stem: inf.slice(0, -1), pluralEnding: 'n' };
}

/** arbeit-, find-, öffn-, atm-: need an extra -e- before -st/-t. */
function needsE(stem: string): boolean {
  if (endsWithAny(stem, ['t', 'd'])) return true;
  const last = stem.at(-1);
  const prev = stem.at(-2);
  if (prev === 'h' && stem.at(-3) === 'c') return true; // zeichn-, rechn-
  return (last === 'm' || last === 'n') && !!prev && !'aeiouäöüylrhmn'.includes(prev.toLowerCase());
}

/** heiß-, tanz-, reis-, mix-: du-form takes only -t. */
const sStem = (stem: string) => endsWithAny(stem, ['s', 'ß', 'z', 'x']);

/** Regular present tense, ignoring any vowel change. */
export function regularPresent(inf: string): Six {
  const { stem, pluralEnding } = splitInfinitive(inf);
  const e = needsE(stem) ? 'e' : '';
  const ich = pluralEnding === 'n' && stem.endsWith('el') ? `${stem.slice(0, -2)}le` : `${stem}e`;
  return [
    ich,
    sStem(stem) ? `${stem}${e}t` : `${stem}${e}st`,
    `${stem}${e}t`,
    inf,
    `${stem}${e}t`,
    inf,
  ];
}

/** du-form and imperative stem implied by the given 3rd person singular. */
function fromThirdPerson(
  inf: string,
  third: string,
): { du: string; ich: string | null; changedStem: string | null } {
  const { stem } = splitInfinitive(inf);
  const regular = regularPresent(inf);
  if (third === regular[2]) return { du: regular[1], ich: null, changedStem: null };
  if (!third.endsWith('t')) {
    // Modal-like: ich kann / er kann, du kannst; ich weiß / du weißt.
    return { du: sStem(third) ? `${third}t` : `${third}st`, ich: third, changedStem: null };
  }
  // Stems in -t with a vowel change take no ending in the 3rd person: er hält, er tritt.
  if (stem.endsWith('t') && !third.endsWith('et')) {
    return { du: `${third}st`, ich: null, changedStem: third };
  }
  const changed = third.slice(0, -1); // fähr-, gib-, lies-, iss-, läd-
  return { du: sStem(changed) ? third : `${changed}st`, ich: null, changedStem: changed };
}

function presentOf(inf: string, third: string): { forms: Six; changedStem: string | null } {
  const override = PRESENT_OVERRIDES[inf];
  if (override) return { forms: [...override], changedStem: null };
  const regular = regularPresent(inf);
  const { du, ich, changedStem } = fromThirdPerson(inf, third);
  return {
    forms: [ich ?? regular[0], du, third, regular[3], regular[4], regular[5]],
    changedStem,
  };
}

export function preteriteForms(base: string): Six {
  if (base.endsWith('e')) {
    return [base, `${base}st`, base, `${base}n`, `${base}t`, `${base}n`];
  }
  const td = endsWithAny(base, ['t', 'd']);
  const du = td || sStem(base) ? `${base}est` : `${base}st`;
  return [base, du, base, `${base}en`, td ? `${base}et` : `${base}t`, `${base}en`];
}

function imperativeOf(
  inf: string,
  present: Six,
  changedStem: string | null,
): [string, string, string] | null {
  if (MODALS.has(inf)) return null;
  const override = IMPERATIVE_OVERRIDES[inf];
  if (override) return [...override];
  const { stem, pluralEnding } = splitInfinitive(inf);
  let du: string;
  // e→i / e→ie verbs keep the change (gib!, lies!, sieh!); a→ä verbs do not (fahr!).
  if (changedStem && /i/.test(changedStem) && !/i/.test(stem)) du = changedStem;
  else if (pluralEnding === 'n' && stem.endsWith('el')) du = `${stem.slice(0, -2)}le`;
  else if (pluralEnding === 'n') du = `${stem}e`;
  else if (needsE(stem) || stem.endsWith('ig')) du = `${stem}e`;
  // Both "mach!" and "mache!" are correct; textbooks write "mach(e)".
  else du = `${stem}(e)`;
  return [du, present[4], `${inf} Sie`];
}

const withPrefix = (form: string, prefix: string | null) => (prefix ? `${form} ${prefix}` : form);

export function conjugate(lemma: string, v: VerbForms): Conjugation {
  // Separable verbs store "steht auf"; the prefix is the detached last word.
  const thirdParts = v.thirdPerson.trim().split(/\s+/);
  const prefix = thirdParts.length > 1 ? thirdParts[thirdParts.length - 1]! : null;
  const base = prefix && lemma.startsWith(prefix) ? lemma.slice(prefix.length) : lemma;
  const third = thirdParts[0]!;
  const pretBase = v.preterite.trim().split(/\s+/)[0]!;

  const { forms, changedStem } = presentOf(base, third);
  const regular = regularPresent(base);
  const irregularPresent = forms.flatMap((f, i) => (f === regular[i] ? [] : [i]));

  const aux = PRESENT_OVERRIDES[v.auxiliary]!;
  const werden = PRESENT_OVERRIDES.werden!;
  const imperative = imperativeOf(base, forms, changedStem);

  return {
    present: forms.map((f) => withPrefix(f, prefix)) as Six,
    preterite: preteriteForms(pretBase).map((f) => withPrefix(f, prefix)) as Six,
    perfect: aux.map((a) => `${a} ${v.participle}`) as Six,
    future: werden.map((w) => `${w} ${lemma}`) as Six,
    imperative: imperative
      ? [
          withPrefix(imperative[0], prefix),
          withPrefix(imperative[1], prefix),
          prefix ? `${base} Sie ${prefix}` : imperative[2],
        ]
      : null,
    irregularPresent,
    separablePrefix: prefix,
  };
}
