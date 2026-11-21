import type { QuizLog } from '@/quiz/types';
import type { ReadingItem } from './types';

export const questionKey = (itemId: string, questionId: string) =>
  `reading:${itemId}:${questionId}`;

export interface ReadingProgress {
  passed: number;
  total: number;
  complete: boolean;
}

/** Questions answered correctly at least once, per reading item. */
export function readingProgress(
  items: readonly ReadingItem[],
  logs: readonly Pick<QuizLog, 'type' | 'wordId' | 'result' | 'deleted'>[],
): Map<string, ReadingProgress> {
  const passed = new Set(
    logs
      .filter((l) => l.type === 'reading' && !l.deleted && l.result !== 'wrong')
      .map((l) => l.wordId),
  );
  return new Map(
    items.map((it) => {
      const n = it.questions.filter((q) => passed.has(questionKey(it.id, q.id))).length;
      return [
        it.id,
        { passed: n, total: it.questions.length, complete: n === it.questions.length },
      ];
    }),
  );
}
