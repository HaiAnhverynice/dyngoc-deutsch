/**
 * Versioned SQLite migrations, applied in order and tracked via PRAGMA user_version.
 * Never edit a shipped migration; append a new one.
 */
export interface Migration {
  version: number;
  sql: string;
}

const SYNC_COLUMNS = `
  updated_at INTEGER NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  user_id TEXT`;

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
CREATE TABLE words (
  id TEXT PRIMARY KEY NOT NULL,
  lemma TEXT NOT NULL,
  article TEXT,
  plural TEXT,
  pos TEXT NOT NULL,
  level TEXT NOT NULL,
  vi TEXT NOT NULL,
  en TEXT NOT NULL,
  example_de TEXT NOT NULL,
  example_vi TEXT NOT NULL,
  example_en TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  verb TEXT,
  source TEXT NOT NULL,
  sort_index INTEGER NOT NULL DEFAULT 0,${SYNC_COLUMNS}
);
CREATE INDEX idx_words_level ON words(level, sort_index);

CREATE TABLE cards (
  id TEXT PRIMARY KEY NOT NULL,
  word_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'recognize',
  phase TEXT NOT NULL,
  step INTEGER NOT NULL,
  ease REAL NOT NULL,
  interval_days INTEGER NOT NULL,
  due_at INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  lapses INTEGER NOT NULL,
  last_review_at INTEGER,
  created_at INTEGER NOT NULL,${SYNC_COLUMNS}
);
CREATE UNIQUE INDEX idx_cards_word_kind ON cards(word_id, kind);
CREATE INDEX idx_cards_due ON cards(due_at);

CREATE TABLE review_logs (
  id TEXT PRIMARY KEY NOT NULL,
  card_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  rating TEXT NOT NULL,
  prev_phase TEXT NOT NULL,
  next_phase TEXT NOT NULL,
  prev_interval_days INTEGER NOT NULL,
  next_interval_days INTEGER NOT NULL,
  ease REAL NOT NULL,
  reviewed_at INTEGER NOT NULL,
  duration_ms INTEGER,${SYNC_COLUMNS}
);
CREATE INDEX idx_logs_reviewed ON review_logs(reviewed_at);
CREATE INDEX idx_logs_card ON review_logs(card_id);

CREATE TABLE settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE content_meta (
  source TEXT PRIMARY KEY NOT NULL,
  version INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`,
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1]!.version;

export function pendingMigrations(currentVersion: number): Migration[] {
  return MIGRATIONS.filter((m) => m.version > currentVersion).sort((a, b) => a.version - b.version);
}
