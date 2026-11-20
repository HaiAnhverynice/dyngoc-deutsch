import type { Card, ReviewLog, UserDataSnapshot } from '@/db/types';
import { RATINGS } from '@/srs/types';
import { validateWord } from '@/vocab/validate';
import type { Word } from '@/vocab/types';

export const BACKUP_FORMAT = 'dyngoc-backup';
export const BACKUP_FORMAT_VERSION = 1;

export interface BackupFile extends UserDataSnapshot {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  exportedAt: number;
  schemaVersion: number;
}

export function createBackup(
  data: UserDataSnapshot,
  now: number,
  schemaVersion: number,
): BackupFile {
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: now,
    schemaVersion,
    ...data,
  };
}

export const backupFileName = (now: number) => {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, '0');
  return `dyngoc-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (o: Obj, k: string) => typeof o[k] === 'number' && Number.isFinite(o[k]);
const numOrNull = (o: Obj, k: string) => o[k] === null || num(o, k);
const str = (o: Obj, k: string) => typeof o[k] === 'string' && (o[k] as string).length > 0;
const PHASES = ['new', 'learning', 'review', 'relearning'];
const syncOk = (o: Obj) =>
  str(o, 'id') &&
  num(o, 'updatedAt') &&
  typeof o.deleted === 'boolean' &&
  (o.userId === null || typeof o.userId === 'string');

function isCard(v: unknown): v is Card {
  if (!isObj(v)) return false;
  return (
    syncOk(v) &&
    str(v, 'wordId') &&
    v.kind === 'recognize' &&
    PHASES.includes(v.phase as string) &&
    ['step', 'ease', 'intervalDays', 'dueAt', 'reps', 'lapses', 'createdAt'].every((k) =>
      num(v, k),
    ) &&
    numOrNull(v, 'lastReviewAt')
  );
}

function isLog(v: unknown): v is ReviewLog {
  if (!isObj(v)) return false;
  return (
    syncOk(v) &&
    str(v, 'cardId') &&
    str(v, 'wordId') &&
    (RATINGS as readonly string[]).includes(v.rating as string) &&
    PHASES.includes(v.prevPhase as string) &&
    PHASES.includes(v.nextPhase as string) &&
    ['prevIntervalDays', 'nextIntervalDays', 'ease', 'reviewedAt'].every((k) => num(v, k)) &&
    numOrNull(v, 'durationMs')
  );
}

function isImportedWord(v: unknown): v is Word {
  return (
    isObj(v) &&
    validateWord(v).ok &&
    str(v, 'id') &&
    v.source === 'import' &&
    num(v, 'sortIndex') &&
    syncOk(v)
  );
}

export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; reason: string };

/** Validates a backup completely before anything is written. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'JSON' };
  }
  if (!isObj(raw) || raw.format !== BACKUP_FORMAT) return { ok: false, reason: 'format' };
  if (!num(raw, 'formatVersion') || (raw.formatVersion as number) > BACKUP_FORMAT_VERSION) {
    return { ok: false, reason: `formatVersion ${String(raw.formatVersion)}` };
  }
  if (!num(raw, 'exportedAt') || !num(raw, 'schemaVersion')) return { ok: false, reason: 'header' };
  if (!isObj(raw.settings) || !Object.values(raw.settings).every((v) => typeof v === 'string')) {
    return { ok: false, reason: 'settings' };
  }
  const lists = [
    ['cards', isCard],
    ['reviewLogs', isLog],
    ['importedWords', isImportedWord],
  ] as const;
  for (const [key, check] of lists) {
    const list = raw[key];
    if (!Array.isArray(list)) return { ok: false, reason: key };
    const bad = list.findIndex((x) => !check(x));
    if (bad >= 0) return { ok: false, reason: `${key}[${bad}]` };
  }
  return { ok: true, backup: raw as unknown as BackupFile };
}
