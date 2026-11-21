import type { QuizLog } from '@/quiz/types';
import type { Word } from '@/vocab/types';
import type { Repository } from './repository';
import type { Card, ContentMeta, ReviewLog, UserDataSnapshot } from './types';

// Copies keep callers from mutating stored state, mirroring a real database.
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export interface MemoryRepository extends Repository {
  /** Called after every write; used on web to persist user data. */
  onChange: (() => void) | null;
}

export function createMemoryRepository(): MemoryRepository {
  const words = new Map<string, Word>();
  const cards = new Map<string, Card>();
  const logs = new Map<string, ReviewLog>();
  const quizLogs = new Map<string, QuizLog>();
  const settings = new Map<string, string>();
  const meta = new Map<string, ContentMeta>();

  const repo: MemoryRepository = {
    kind: 'memory',
    onChange: null,

    async listWords(opts) {
      return [...words.values()].filter((w) => opts?.includeDeleted || !w.deleted).map(clone);
    },
    async getWord(id) {
      const w = words.get(id);
      return w && !w.deleted ? clone(w) : null;
    },
    async upsertWords(list) {
      for (const w of list) words.set(w.id, clone(w));
      changed();
    },

    async listCards() {
      return [...cards.values()].filter((c) => !c.deleted).map(clone);
    },
    async getCardByWordId(wordId) {
      const c = [...cards.values()].find((x) => x.wordId === wordId && !x.deleted);
      return c ? clone(c) : null;
    },
    async saveCard(card) {
      cards.set(card.id, clone(card));
      changed();
    },
    async saveReview(card, log) {
      cards.set(card.id, clone(card));
      logs.set(log.id, clone(log));
      changed();
    },
    async listReviewLogs(sinceMs) {
      return [...logs.values()]
        .filter((l) => !l.deleted && (sinceMs === undefined || l.reviewedAt >= sinceMs))
        .sort((a, b) => a.reviewedAt - b.reviewedAt)
        .map(clone);
    },

    async saveQuizLog(log) {
      quizLogs.set(log.id, clone(log));
      changed();
    },
    async listQuizLogs(sinceMs) {
      return [...quizLogs.values()]
        .filter((l) => !l.deleted && (sinceMs === undefined || l.answeredAt >= sinceMs))
        .sort((a, b) => a.answeredAt - b.answeredAt)
        .map(clone);
    },

    async getSettings() {
      return Object.fromEntries(settings);
    },
    async setSettings(values) {
      for (const [k, v] of Object.entries(values)) settings.set(k, v);
      changed();
    },

    async listContentMeta() {
      return [...meta.values()].map(clone);
    },
    async setContentMeta(m) {
      meta.set(m.source, clone(m));
    },

    async exportUserData() {
      return {
        settings: Object.fromEntries(settings),
        cards: [...cards.values()].map(clone),
        reviewLogs: [...logs.values()].map(clone),
        quizLogs: [...quizLogs.values()].map(clone),
        importedWords: [...words.values()].filter((w) => w.source === 'import').map(clone),
      };
    },
    async replaceUserData(data: UserDataSnapshot) {
      cards.clear();
      logs.clear();
      quizLogs.clear();
      settings.clear();
      for (const [id, w] of words) if (w.source === 'import') words.delete(id);
      for (const c of data.cards) cards.set(c.id, clone(c));
      for (const l of data.reviewLogs) logs.set(l.id, clone(l));
      for (const l of data.quizLogs) quizLogs.set(l.id, clone(l));
      for (const [k, v] of Object.entries(data.settings)) settings.set(k, v);
      for (const w of data.importedWords) words.set(w.id, clone(w));
      changed();
    },
  };

  function changed() {
    repo.onChange?.();
  }
  return repo;
}
