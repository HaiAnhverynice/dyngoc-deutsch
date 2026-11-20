import type { UiLanguage } from '@/i18n';
import { addLocalDays, atLocalMinute, startOfCalendarDay } from '@/srs/day';
import type { CardPhase } from '@/srs/types';
import type { Word } from '@/vocab/types';
import type { NotificationSettings, PlannedNotification } from './types';

/** iOS allows 64 pending local notifications; keep headroom. */
export const MAX_PENDING = 60;
export const HORIZON_DAYS = 30;

export interface NotificationCandidate {
  word: Pick<Word, 'id' | 'lemma' | 'article' | 'vi' | 'en' | 'example'>;
  /** null = no card yet (unseen word of an active level). */
  phase: CardPhase | null;
  dueAt: number | null;
}

/** Half-open [start, end) in minutes; wraps past midnight when start > end; empty when equal. */
export function inMinuteRange(m: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? m >= start && m < end : m >= start || m < end;
}

/** Minutes of day for hourly mode: every N hours from windowStart through windowEnd (inclusive). */
export function hourlyMinutes(s: NotificationSettings): number[] {
  const len = (s.windowEnd - s.windowStart + 1440) % 1440;
  const step = Math.max(1, s.everyHours) * 60;
  const out: number[] = [];
  // len 0 means start == end: treat as a full day, end exclusive.
  const limit = len === 0 ? 1439 : len;
  for (let off = 0; off <= limit; off += step) out.push((s.windowStart + off) % 1440);
  return [...new Set(out)].sort((a, b) => a - b);
}

export function notificationTimes(
  s: NotificationSettings,
  now: number,
  max = MAX_PENDING,
  horizonDays = HORIZON_DAYS,
): number[] {
  if (!s.enabled) return [];
  const minutes = (
    s.mode === 'hourly' ? hourlyMinutes(s) : [...s.dailyTimes].sort((a, b) => a - b)
  ).filter((m) => !(s.quietEnabled && inMinuteRange(m, s.quietStart, s.quietEnd)));
  if (minutes.length === 0) return [];

  const out: number[] = [];
  const today = startOfCalendarDay(now);
  for (let d = 0; d <= horizonDays && out.length < max; d++) {
    const day = addLocalDays(today, d);
    for (const m of minutes) {
      const at = atLocalMinute(day, m);
      if (at > now) out.push(at);
      if (out.length >= max) break;
    }
  }
  return out;
}

const PRIORITY: Record<CardPhase | 'unseen', number> = {
  learning: 0,
  relearning: 0,
  review: 1,
  new: 2,
  unseen: 3,
};

/** Learning first, then reviews (soonest due first), then queued new cards, then unseen words. */
export function prioritize(candidates: NotificationCandidate[]): NotificationCandidate[] {
  const seen = new Set<string>();
  return candidates
    .map((c, i) => ({ c, i }))
    .sort(
      (a, b) =>
        PRIORITY[a.c.phase ?? 'unseen'] - PRIORITY[b.c.phase ?? 'unseen'] ||
        (a.c.dueAt ?? Infinity) - (b.c.dueAt ?? Infinity) ||
        a.i - b.i,
    )
    .map((x) => x.c)
    .filter((c) => (seen.has(c.word.id) ? false : (seen.add(c.word.id), true)));
}

export function formatNotification(
  w: NotificationCandidate['word'],
  lang: UiLanguage,
): { title: string; body: string } {
  const head = w.article ? `${w.article} ${w.lemma}` : w.lemma;
  const meaning = lang === 'vi' ? w.vi : lang === 'en' ? w.en : `${w.vi} / ${w.en}`;
  const translation =
    lang === 'vi'
      ? w.example.vi
      : lang === 'en'
        ? w.example.en
        : [w.example.vi, w.example.en].filter(Boolean).join('\n');
  return {
    title: `${head} · ${meaning}`,
    body: translation ? `${w.example.de}\n${translation}` : w.example.de,
  };
}

/** Pure: settings + words + now → notifications to schedule. Words repeat only after all were used. */
export function planNotifications(input: {
  settings: NotificationSettings;
  lang: UiLanguage;
  candidates: NotificationCandidate[];
  now: number;
  max?: number;
}): PlannedNotification[] {
  const ordered = prioritize(input.candidates);
  if (ordered.length === 0) return [];
  return notificationTimes(input.settings, input.now, input.max).map((at, i) => {
    const word = ordered[i % ordered.length]!.word;
    return { at, wordId: word.id, ...formatNotification(word, input.lang) };
  });
}
