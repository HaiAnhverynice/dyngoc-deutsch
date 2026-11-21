import { GRAMMAR_FILES } from '@content/index';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { lessonProgress, type LessonProgress } from '@/grammar/progress';
import { useApp } from '@/state/AppContext';
import { useStudySnapshot } from '@/state/useStudySnapshot';
import { pick } from '@/ui/components/Lesson';
import { Card, Screen, T } from '@/ui/components/primitives';
import { spacing, useTheme } from '@/ui/theme';

const LESSONS = GRAMMAR_FILES.flatMap((f) => f.lessons);

export default function GrammarScreen() {
  const { repo, t, settings, dataVersion } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const { snap } = useStudySnapshot();
  const [progress, setProgress] = useState<Map<string, LessonProgress>>(new Map());

  useFocusEffect(
    useCallback(() => {
      void repo.listQuizLogs().then((logs) => setProgress(lessonProgress(LESSONS, logs)));
      // dataVersion is a deliberate trigger.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repo, dataVersion]),
  );

  const verbCount = snap?.words.filter((w) => w.verb).length ?? 0;

  return (
    <Screen scroll contentStyle={styles.content}>
      <Pressable accessibilityRole="link" onPress={() => router.push('/verbs')}>
        <Card style={styles.gap}>
          <T variant="title">{t('grammar.verbs')}</T>
          <T variant="small">{t('grammar.verbsHint', { n: verbCount })}</T>
        </Card>
      </Pressable>

      {GRAMMAR_FILES.map((file) => (
        <View key={file.level} style={styles.gap}>
          <T variant="small" style={styles.level}>
            {file.level}
          </T>
          {file.lessons.map((lesson, i) => {
            const p = progress.get(lesson.id);
            return (
              <Pressable
                key={lesson.id}
                accessibilityRole="link"
                onPress={() =>
                  router.push({ pathname: '/grammar/[id]', params: { id: lesson.id } })
                }
              >
                <Card style={styles.row}>
                  <T variant="title" style={[styles.num, { color: c.primary }]}>
                    {i + 1}
                  </T>
                  <View style={styles.flex}>
                    <T variant="heading">{pick(lesson.title, settings.uiLang)[0]}</T>
                    <T variant="small">{pick(lesson.summary, settings.uiLang)[0]}</T>
                    {p && (
                      <T
                        variant="small"
                        style={{ color: p.complete ? c.success : c.textMuted, fontWeight: '600' }}
                      >
                        {p.complete
                          ? t('grammar.complete')
                          : t('grammar.progress', { done: p.passed, n: p.total })}
                      </T>
                    )}
                  </View>
                  <T variant="muted">›</T>
                </Card>
              </Pressable>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  gap: { gap: spacing.sm },
  flex: { flex: 1, gap: 2 },
  level: { letterSpacing: 0.5, marginLeft: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  num: { width: 28, textAlign: 'center' },
});
