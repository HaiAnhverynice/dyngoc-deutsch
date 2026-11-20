import {
  ARTICLES,
  LEVELS,
  PARTS_OF_SPEECH,
  type Article,
  type ContentFile,
  type Level,
  type PartOfSpeech,
  type VerbForms,
  type WordContent,
} from './types';

export type ValidationCode =
  | 'required'
  | 'invalidPos'
  | 'invalidLevel'
  | 'nounNeedsArticle'
  | 'articleOnlyNouns'
  | 'nounCapital'
  | 'invalidVerb'
  | 'invalidId'
  | 'invalidType';

export interface ValidationIssue {
  code: ValidationCode;
  field: string;
}

export type ValidationResult =
  | { ok: true; word: Omit<WordContent, 'id'> & { id?: string } }
  | { ok: false; issues: ValidationIssue[] };

export const ID_PATTERN = /^[a-z0-9]+(\.[a-z0-9-]+)+$/;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Validates one word from JSON/CSV. `id` is optional here; importers generate one. */
export function validateWord(raw: unknown): ValidationResult {
  if (!isObj(raw)) return { ok: false, issues: [{ code: 'invalidType', field: 'word' }] };
  const issues: ValidationIssue[] = [];
  const need = (field: string, v: string) => {
    if (!v) issues.push({ code: 'required', field });
  };

  const lemma = str(raw.lemma);
  need('lemma', lemma);
  const pos = str(raw.pos) as PartOfSpeech;
  if (!PARTS_OF_SPEECH.includes(pos)) issues.push({ code: 'invalidPos', field: 'pos' });
  const level = str(raw.level).toUpperCase() as Level;
  if (!LEVELS.includes(level)) issues.push({ code: 'invalidLevel', field: 'level' });

  const articleRaw = str(raw.article).toLowerCase();
  const article = (articleRaw || null) as Article | null;
  if (pos === 'noun') {
    if (!article || !ARTICLES.includes(article)) {
      issues.push({ code: 'nounNeedsArticle', field: 'article' });
    }
    if (lemma && lemma[0] !== lemma[0]!.toUpperCase()) {
      issues.push({ code: 'nounCapital', field: 'lemma' });
    }
  } else if (article) {
    issues.push({ code: 'articleOnlyNouns', field: 'article' });
  }

  const pluralRaw = str(raw.plural);
  const plural = pos === 'noun' && pluralRaw && pluralRaw !== '-' ? pluralRaw : null;

  const vi = str(raw.vi);
  const en = str(raw.en);
  need('vi', vi);
  need('en', en);

  const ex = isObj(raw.example) ? raw.example : {};
  const example = { de: str(ex.de), vi: str(ex.vi), en: str(ex.en) };
  need('example.de', example.de);

  let tags: string[] = [];
  if (raw.tags !== undefined) {
    if (Array.isArray(raw.tags) && raw.tags.every((t) => typeof t === 'string')) {
      tags = [
        ...new Set((raw.tags as string[]).map((t) => t.trim().toLowerCase()).filter(Boolean)),
      ];
    } else {
      issues.push({ code: 'invalidType', field: 'tags' });
    }
  }

  let verb: VerbForms | undefined;
  if (raw.verb !== undefined && raw.verb !== null) {
    const v = isObj(raw.verb) ? raw.verb : {};
    const aux = str(v.auxiliary);
    const forms = {
      thirdPerson: str(v.thirdPerson),
      preterite: str(v.preterite),
      participle: str(v.participle),
    };
    if (Object.values(forms).some((f) => !f) || (aux !== 'haben' && aux !== 'sein')) {
      issues.push({ code: 'invalidVerb', field: 'verb' });
    } else {
      verb = { ...forms, auxiliary: aux };
    }
  }

  let id: string | undefined;
  if (raw.id !== undefined) {
    id = str(raw.id);
    if (!ID_PATTERN.test(id)) issues.push({ code: 'invalidId', field: 'id' });
  }

  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    word: {
      ...(id ? { id } : {}),
      lemma,
      article: pos === 'noun' ? article : null,
      plural,
      pos,
      level,
      vi,
      en,
      example,
      tags,
      ...(verb ? { verb } : {}),
    },
  };
}

/** Strict check for bundled content: every word valid, with an id and complete translations. */
export function validateContentFile(raw: unknown): string[] {
  const errors: string[] = [];
  if (!isObj(raw) || !Array.isArray(raw.words) || typeof raw.version !== 'number') {
    return ['file must be { version, level, words[] }'];
  }
  const file = raw as unknown as ContentFile;
  const ids = new Set<string>();
  file.words.forEach((w, i) => {
    const r = validateWord(w);
    const label = `${file.level}#${i} ${(w as { id?: string }).id ?? '?'}`;
    if (!r.ok) {
      errors.push(`${label}: ${r.issues.map((x) => `${x.field}:${x.code}`).join(', ')}`);
      return;
    }
    if (!r.word.id) errors.push(`${label}: missing id`);
    else if (ids.has(r.word.id)) errors.push(`${label}: duplicate id`);
    else ids.add(r.word.id);
    if (r.word.level !== file.level) errors.push(`${label}: level mismatch`);
    if (!r.word.example.vi || !r.word.example.en) errors.push(`${label}: example translation`);
    if (r.word.pos === 'verb' && !r.word.verb) errors.push(`${label}: verb forms missing`);
  });
  return errors;
}
