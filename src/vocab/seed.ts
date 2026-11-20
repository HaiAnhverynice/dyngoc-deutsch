import type { Repository } from '@/db/repository';
import type { ContentFile, Word } from './types';

export const contentSource = (file: Pick<ContentFile, 'level'>) =>
  `vocab.${file.level.toLowerCase()}`;

/**
 * Loads bundled content into the repository when its version is newer than what was
 * seeded. Words are matched by stable id, so cards (keyed by word id) survive updates.
 * Words dropped from content are soft-deleted, never removed, to keep history intact.
 */
export async function seedContent(
  repo: Repository,
  files: ContentFile[],
  now: number,
): Promise<string[]> {
  const meta = new Map((await repo.listContentMeta()).map((m) => [m.source, m.version]));
  const pending = files.filter((f) => (meta.get(contentSource(f)) ?? 0) < f.version);
  if (pending.length === 0) return [];

  const all = await repo.listWords({ includeDeleted: true });
  const seeded: string[] = [];
  for (const file of pending) {
    const fresh = new Set(file.words.map((w) => w.id));
    const removed = all
      .filter(
        (w) => w.source === 'builtin' && w.level === file.level && !fresh.has(w.id) && !w.deleted,
      )
      .map((w) => ({ ...w, deleted: true, updatedAt: now }));
    const words: Word[] = file.words.map((w, i) => ({
      ...w,
      source: 'builtin',
      sortIndex: i,
      updatedAt: now,
      deleted: false,
      userId: null,
    }));
    await repo.upsertWords([...words, ...removed]);
    await repo.setContentMeta({
      source: contentSource(file),
      version: file.version,
      updatedAt: now,
    });
    seeded.push(contentSource(file));
  }
  return seeded;
}
