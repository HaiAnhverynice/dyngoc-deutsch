import type { Repository } from '@/db/repository';
import { summarizeProgress, type ProgressSummary } from '@/progress';
import { buildQuiz } from '@/quiz/build';
import { shuffle, type Rng } from '@/quiz/random';
import type { Question, QuizLog, QuizResult, QuizType } from '@/quiz/types';
import type { Word } from '@/vocab/types';
import type { AppSettings } from './settings';
import type { IdFactory, StudySnapshot } from './study';

/**
 * Words already being studied come first (the quiz reinforces them), then the rest
 * of the selected levels. Quizzes never touch SRS scheduling.
 */
export function quizWordPools(
  snap: Pick<StudySnapshot, 'words' | 'cards' | 'wordsById'>,
  settings: Pick<AppSettings, 'levels'>,
  rng: Rng,
): { targets: Word[]; all: Word[] } {
  const studiedIds = new Set(snap.cards.filter((c) => c.phase !== 'new').map((c) => c.wordId));
  const studied = [...studiedIds].map((id) => snap.wordsById.get(id)).filter((w) => !!w);
  const inLevels = snap.words.filter((w) => settings.levels.includes(w.level));
  const rest = inLevels.filter((w) => !studiedIds.has(w.id));
  return {
    targets: [...shuffle(studied, rng), ...shuffle(rest, rng)],
    all: [...studied, ...rest],
  };
}

export function createQuizSession(
  snap: Pick<StudySnapshot, 'words' | 'cards' | 'wordsById'>,
  settings: AppSettings,
  types: QuizType[],
  count: number,
  rng: Rng,
): Question[] {
  const { targets, all } = quizWordPools(snap, settings, rng);
  return buildQuiz({ targets, all, types, count, rng });
}

export async function saveQuizAnswer(
  repo: Repository,
  q: Pick<Question, 'type' | 'wordId'>,
  result: QuizResult,
  now: number,
  durationMs: number | null,
  makeId: IdFactory,
): Promise<QuizLog> {
  const log: QuizLog = {
    id: makeId(),
    wordId: q.wordId,
    type: q.type,
    result,
    answeredAt: now,
    durationMs,
    updatedAt: now,
    deleted: false,
    userId: null,
  };
  await repo.saveQuizLog(log);
  return log;
}

export async function loadProgress(repo: Repository, now: number): Promise<ProgressSummary> {
  const [reviews, quizzes] = await Promise.all([repo.listReviewLogs(), repo.listQuizLogs()]);
  return summarizeProgress(reviews, quizzes, now);
}
