import { MIGRATIONS, pendingMigrations, SCHEMA_VERSION } from './migrations';

describe('migrations', () => {
  it('are numbered 1..n without gaps', () => {
    expect(MIGRATIONS.map((m) => m.version)).toEqual(MIGRATIONS.map((_, i) => i + 1));
    expect(SCHEMA_VERSION).toBe(MIGRATIONS.length);
  });

  it('selects only pending migrations', () => {
    expect(pendingMigrations(0)).toHaveLength(MIGRATIONS.length);
    expect(pendingMigrations(SCHEMA_VERSION)).toHaveLength(0);
  });

  it('gives every user table the sync columns', () => {
    const sql = MIGRATIONS.map((m) => m.sql).join('\n');
    for (const table of ['words', 'cards', 'review_logs', 'quiz_logs']) {
      const body = sql.split(`CREATE TABLE ${table} (`)[1]!.split(');')[0]!;
      expect(body).toMatch(/updated_at INTEGER NOT NULL/);
      expect(body).toMatch(/deleted INTEGER NOT NULL DEFAULT 0/);
      expect(body).toMatch(/user_id TEXT/);
    }
  });
});
