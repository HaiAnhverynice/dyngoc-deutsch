import { createMemoryRepository } from './memoryRepository';
import type { Repository } from './repository';
import type { UserDataSnapshot } from './types';

/**
 * Web: SQLite-on-web needs WASM plus COOP/COEP headers, so we use the in-memory
 * repository and persist user data (not bundled content) to localStorage.
 * Limits: ~5 MB quota, per-browser/per-origin, cleared with site data.
 */
const STORAGE_KEY = 'dyngoc.userdata.v1';
const SAVE_DELAY_MS = 300;

export async function createRepository(): Promise<Repository> {
  const repo = createMemoryRepository();
  const stored = readStorage();
  if (stored) await repo.replaceUserData(stored);

  let timer: ReturnType<typeof setTimeout> | null = null;
  repo.onChange = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void repo.exportUserData().then((data) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.warn('Could not persist to localStorage', e);
        }
      });
    }, SAVE_DELAY_MS);
  };
  return repo;
}

function readStorage(): UserDataSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as UserDataSnapshot;
    // Saved before quiz logs existed (phase 1).
    return { ...data, quizLogs: data.quizLogs ?? [] };
  } catch {
    return null;
  }
}
