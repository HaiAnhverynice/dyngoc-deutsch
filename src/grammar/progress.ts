import type { QuizLog } from '@/quiz/types';
import type { Lesson } from './types';

export const exerciseKey = (lessonId: string, exerciseId: string) =>
  `grammar:${lessonId}:${exerciseId}`;

export interface LessonProgress {
  /** Exercises answered correctly at least once. */
  passed: number;
  total: number;
  complete: boolean;
}

export function lessonProgress(
  lessons: readonly Lesson[],
  logs: readonly Pick<QuizLog, 'type' | 'wordId' | 'result' | 'deleted'>[],
): Map<string, LessonProgress> {
  const passed = new Set(
    logs
      .filter((l) => l.type === 'grammar' && !l.deleted && l.result !== 'wrong')
      .map((l) => l.wordId),
  );
  return new Map(
    lessons.map((lesson) => {
      const n = lesson.exercises.filter((e) => passed.has(exerciseKey(lesson.id, e.id))).length;
      const total = lesson.exercises.length;
      return [lesson.id, { passed: n, total, complete: n === total }];
    }),
  );
}
