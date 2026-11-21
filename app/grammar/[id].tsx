import { GRAMMAR_FILES } from '@content/index';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useApp } from '@/state/AppContext';
import { saveQuizAnswer } from '@/state/quiz';
import { Exercises, LessonBlocks, pick } from '@/ui/components/Lesson';
import { Screen, T } from '@/ui/components/primitives';
import { spacing } from '@/ui/theme';
import type { QuizResult } from '@/quiz/types';

const LESSONS = new Map(GRAMMAR_FILES.flatMap((f) => f.lessons).map((l) => [l.id, l]));

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repo, makeId, t, settings, notifyDataChanged } = useApp();
  const lesson = id ? LESSONS.get(id) : undefined;

  const onAnswer = useCallback(
    (key: string, result: QuizResult) => {
      saveQuizAnswer(repo, { type: 'grammar', wordId: key }, result, Date.now(), null, makeId)
        .then(notifyDataChanged)
        .catch((e: unknown) => console.warn('grammar log failed', e));
    },
    [repo, makeId, notifyDataChanged],
  );

  if (!lesson) {
    return (
      <Screen>
        <T variant="muted">{t('grammar.notFound')}</T>
      </Screen>
    );
  }
  const lang = settings.uiLang;
  return (
    <Screen scroll contentStyle={styles.content}>
      <Stack.Screen options={{ title: pick(lesson.title, lang)[0] }} />
      <T variant="title">{pick(lesson.title, lang).join(' / ')}</T>
      <T variant="muted">{pick(lesson.summary, lang)[0]}</T>
      <LessonBlocks lesson={lesson} lang={lang} t={t} />
      <Exercises lesson={lesson} lang={lang} t={t} onAnswer={onAnswer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
});
