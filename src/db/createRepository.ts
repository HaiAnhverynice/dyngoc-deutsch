import { openDatabaseAsync } from 'expo-sqlite';
import type { Repository } from './repository';
import { createSqliteRepository, migrate } from './sqliteRepository';

export const DB_NAME = 'dyngoc.db';

/** Native (iOS/Android): SQLite file in the app sandbox. Web uses createRepository.web.ts. */
export async function createRepository(): Promise<Repository> {
  const db = await openDatabaseAsync(DB_NAME);
  await migrate(db);
  return createSqliteRepository(db);
}
