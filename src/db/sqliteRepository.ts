import type { SQLiteDatabase } from 'expo-sqlite';
import type { CardPhase, Rating } from '@/srs/types';
import type { Article, Level, PartOfSpeech, VerbForms, Word, WordSource } from '@/vocab/types';
import { pendingMigrations } from './migrations';
import type { Repository } from './repository';
import type { Card, CardKind, ContentMeta, ReviewLog } from './types';

interface WordRow {
  id: string;
  lemma: string;
  article: string | null;
  plural: string | null;
  pos: string;
  level: string;
  vi: string;
  en: string;
  example_de: string;
  example_vi: string;
  example_en: string;
  tags: string;
  verb: string | null;
  source: string;
  sort_index: number;
  updated_at: number;
  deleted: number;
  user_id: string | null;
}

interface CardRow {
  id: string;
  word_id: string;
  kind: string;
  phase: string;
  step: number;
  ease: number;
  interval_days: number;
  due_at: number;
  reps: number;
  lapses: number;
  last_review_at: number | null;
  created_at: number;
  updated_at: number;
  deleted: number;
  user_id: string | null;
}

interface LogRow {
  id: string;
  card_id: string;
  word_id: string;
  rating: string;
  prev_phase: string;
  next_phase: string;
  prev_interval_days: number;
  next_interval_days: number;
  ease: number;
  reviewed_at: number;
  duration_ms: number | null;
  updated_at: number;
  deleted: number;
  user_id: string | null;
}

// Rows are written only by this module, so enum columns are trusted on read.
const toWord = (r: WordRow): Word => ({
  id: r.id,
  lemma: r.lemma,
  article: r.article as Article | null,
  plural: r.plural,
  pos: r.pos as PartOfSpeech,
  level: r.level as Level,
  vi: r.vi,
  en: r.en,
  example: { de: r.example_de, vi: r.example_vi, en: r.example_en },
  tags: JSON.parse(r.tags) as string[],
  ...(r.verb ? { verb: JSON.parse(r.verb) as VerbForms } : {}),
  source: r.source as WordSource,
  sortIndex: r.sort_index,
  updatedAt: r.updated_at,
  deleted: r.deleted === 1,
  userId: r.user_id,
});

const toCard = (r: CardRow): Card => ({
  id: r.id,
  wordId: r.word_id,
  kind: r.kind as CardKind,
  phase: r.phase as CardPhase,
  step: r.step,
  ease: r.ease,
  intervalDays: r.interval_days,
  dueAt: r.due_at,
  reps: r.reps,
  lapses: r.lapses,
  lastReviewAt: r.last_review_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deleted: r.deleted === 1,
  userId: r.user_id,
});

const toLog = (r: LogRow): ReviewLog => ({
  id: r.id,
  cardId: r.card_id,
  wordId: r.word_id,
  rating: r.rating as Rating,
  prevPhase: r.prev_phase as CardPhase,
  nextPhase: r.next_phase as CardPhase,
  prevIntervalDays: r.prev_interval_days,
  nextIntervalDays: r.next_interval_days,
  ease: r.ease,
  reviewedAt: r.reviewed_at,
  durationMs: r.duration_ms,
  updatedAt: r.updated_at,
  deleted: r.deleted === 1,
  userId: r.user_id,
});

const WORD_UPSERT = `INSERT OR REPLACE INTO words
  (id, lemma, article, plural, pos, level, vi, en, example_de, example_vi, example_en,
   tags, verb, source, sort_index, updated_at, deleted, user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const wordParams = (w: Word) => [
  w.id,
  w.lemma,
  w.article,
  w.plural,
  w.pos,
  w.level,
  w.vi,
  w.en,
  w.example.de,
  w.example.vi,
  w.example.en,
  JSON.stringify(w.tags),
  w.verb ? JSON.stringify(w.verb) : null,
  w.source,
  w.sortIndex,
  w.updatedAt,
  w.deleted ? 1 : 0,
  w.userId,
];

const CARD_UPSERT = `INSERT OR REPLACE INTO cards
  (id, word_id, kind, phase, step, ease, interval_days, due_at, reps, lapses, last_review_at,
   created_at, updated_at, deleted, user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const cardParams = (c: Card) => [
  c.id,
  c.wordId,
  c.kind,
  c.phase,
  c.step,
  c.ease,
  c.intervalDays,
  c.dueAt,
  c.reps,
  c.lapses,
  c.lastReviewAt,
  c.createdAt,
  c.updatedAt,
  c.deleted ? 1 : 0,
  c.userId,
];

const LOG_INSERT = `INSERT OR REPLACE INTO review_logs
  (id, card_id, word_id, rating, prev_phase, next_phase, prev_interval_days, next_interval_days,
   ease, reviewed_at, duration_ms, updated_at, deleted, user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const logParams = (l: ReviewLog) => [
  l.id,
  l.cardId,
  l.wordId,
  l.rating,
  l.prevPhase,
  l.nextPhase,
  l.prevIntervalDays,
  l.nextIntervalDays,
  l.ease,
  l.reviewedAt,
  l.durationMs,
  l.updatedAt,
  l.deleted ? 1 : 0,
  l.userId,
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  for (const m of pendingMigrations(row?.user_version ?? 0)) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(m.sql);
      await db.execAsync(`PRAGMA user_version = ${m.version}`);
    });
  }
}

/** Runs `sql` once per item with a single prepared statement. Caller provides the transaction. */
async function runMany<T>(
  db: SQLiteDatabase,
  sql: string,
  items: T[],
  params: (item: T) => (string | number | null)[],
) {
  const stmt = await db.prepareAsync(sql);
  try {
    for (const it of items) await stmt.executeAsync(params(it));
  } finally {
    await stmt.finalizeAsync();
  }
}

export function createSqliteRepository(db: SQLiteDatabase): Repository {
  return {
    kind: 'sqlite',

    async listWords(opts) {
      const rows = await db.getAllAsync<WordRow>(
        opts?.includeDeleted
          ? 'SELECT * FROM words'
          : 'SELECT * FROM words WHERE deleted = 0 ORDER BY level, sort_index',
      );
      return rows.map(toWord);
    },
    async getWord(id) {
      const r = await db.getFirstAsync<WordRow>(
        'SELECT * FROM words WHERE id = ? AND deleted = 0',
        id,
      );
      return r ? toWord(r) : null;
    },
    async upsertWords(words) {
      await db.withTransactionAsync(() => runMany(db, WORD_UPSERT, words, wordParams));
    },

    async listCards() {
      const rows = await db.getAllAsync<CardRow>('SELECT * FROM cards WHERE deleted = 0');
      return rows.map(toCard);
    },
    async getCardByWordId(wordId) {
      const r = await db.getFirstAsync<CardRow>(
        'SELECT * FROM cards WHERE word_id = ? AND deleted = 0',
        wordId,
      );
      return r ? toCard(r) : null;
    },
    async saveCard(card) {
      await db.runAsync(CARD_UPSERT, cardParams(card));
    },
    async saveReview(card, log) {
      await db.withTransactionAsync(async () => {
        await db.runAsync(CARD_UPSERT, cardParams(card));
        await db.runAsync(LOG_INSERT, logParams(log));
      });
    },
    async listReviewLogs(sinceMs) {
      const rows = await db.getAllAsync<LogRow>(
        'SELECT * FROM review_logs WHERE deleted = 0 AND reviewed_at >= ? ORDER BY reviewed_at',
        sinceMs ?? 0,
      );
      return rows.map(toLog);
    },

    async getSettings() {
      const rows = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings',
      );
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    },
    async setSettings(values, now) {
      await db.withTransactionAsync(() =>
        runMany(
          db,
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
          Object.entries(values),
          ([k, v]) => [k, v, now],
        ),
      );
    },

    async listContentMeta() {
      const rows = await db.getAllAsync<{ source: string; version: number; updated_at: number }>(
        'SELECT * FROM content_meta',
      );
      return rows.map((r) => ({ source: r.source, version: r.version, updatedAt: r.updated_at }));
    },
    async setContentMeta(m: ContentMeta) {
      await db.runAsync(
        'INSERT OR REPLACE INTO content_meta (source, version, updated_at) VALUES (?, ?, ?)',
        m.source,
        m.version,
        m.updatedAt,
      );
    },

    async exportUserData() {
      const [settingRows, cardRows, logRows, wordRows] = await Promise.all([
        db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings'),
        db.getAllAsync<CardRow>('SELECT * FROM cards'),
        db.getAllAsync<LogRow>('SELECT * FROM review_logs ORDER BY reviewed_at'),
        db.getAllAsync<WordRow>("SELECT * FROM words WHERE source = 'import'"),
      ]);
      return {
        settings: Object.fromEntries(settingRows.map((r) => [r.key, r.value])),
        cards: cardRows.map(toCard),
        reviewLogs: logRows.map(toLog),
        importedWords: wordRows.map(toWord),
      };
    },
    async replaceUserData(data) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(
          "DELETE FROM cards; DELETE FROM review_logs; DELETE FROM settings; DELETE FROM words WHERE source = 'import';",
        );
        await runMany(db, WORD_UPSERT, data.importedWords, wordParams);
        await runMany(db, CARD_UPSERT, data.cards, cardParams);
        await runMany(db, LOG_INSERT, data.reviewLogs, logParams);
        await runMany(
          db,
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
          Object.entries(data.settings),
          ([k, v]) => [k, v, Date.now()],
        );
      });
    },
  };
}
