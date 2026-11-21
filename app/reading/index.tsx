import { READING_FILE } from '@content/index';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { readingProgress, type ReadingProgress } from '@/reading/progress';
import { useApp } from '@/state/AppContext';
import { pick } from '@/ui/components/Lesson';
import { Card, Screen, T } from '@/ui/components/primitives';
import { spacing, useTheme } from '@/ui/theme';
import { LEVELS } from '@/vocab/types';

const ITEMS = READING_FILE.items;

export default function ReadingListScreen() {
  const { repo, t, settings, dataVersion } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const [progress, setProgress] = useState<Map<string, ReadingProgress>>(new Map());

  useFocusEffect(
    useCallback(() => {
      void repo.listQuizLogs().then((logs) => setProgress(readingProgress(ITEMS, logs)));
      // dataVersion is a deliberate trigger.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repo, dataVersion]),
  );

  // Levels being studied come first.
  const levels = [...settings.levels, ...LEVELS.filter((l) => !settings.levels.includes(l))].filter(
    (l) => ITEMS.some((i) => i.level === l),
  );

  return (
    <Screen scroll contentStyle={styles.content}>
      {levels.map((level) => (
        <View key={level} style={styles.gap}>
          <T variant="small" style={styles.level}>
            {level}
          </T>
          {ITEMS.filter((i) => i.level === level).map((it) => {
            const p = progress.get(it.id);
            return (
              <Pressable
                key={it.id}
                accessibilityRole="link"
                onPress={() => router.push({ pathname: '/reading/[id]', params: { id: it.id } })}
              >
                <Card style={styles.row}>
                  <T variant="title" style={styles.icon}>
                    {it.kind === 'dialogue' ? '💬' : '📖'}
                  </T>
                  <View style={styles.flex}>
                    <T variant="heading">{pick(it.title, settings.uiLang)[0]}</T>
                    <T variant="small">{pick(it.intro, settings.uiLang)[0]}</T>
                    <T
                      variant="small"
                      style={{ color: p?.complete ? c.success : c.textMuted, fontWeight: '600' }}
                    >
                      {t(it.kind === 'dialogue' ? 'reading.dialogue' : 'reading.text')} ·{' '}
                      {p?.complete
                        ? t('reading.complete')
                        : t('reading.progress', { done: p?.passed ?? 0, n: it.questions.length })}
                    </T>
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
  icon: { width: 32, textAlign: 'center' },
});
