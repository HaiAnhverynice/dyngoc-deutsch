import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createT, type TranslationKey } from '@/i18n';
import { setAppBadge } from '@/notifications/webPush';
import type { DayStat } from '@/progress';
import { useApp } from '@/state/AppContext';
import { useProgress } from '@/state/useProgress';
import { useStudySnapshot } from '@/state/useStudySnapshot';
import { Button, Card, Screen, T } from '@/ui/components/primitives';
import { WeekChart } from '@/ui/components/WeekChart';
import { spacing, useTheme } from '@/ui/theme';

export default function HomeScreen() {
  const { t, settings } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const { snap } = useStudySnapshot();
  const progress = useProgress();

  const due = snap?.dueToday ?? 0;
  const fresh = snap?.newToday ?? 0;
  const hasWork = due + fresh > 0;

  // Web: cards left today on the Home Screen icon (refreshed whenever this screen loads).
  useEffect(() => {
    if (snap) void setAppBadge(snap.dueToday + snap.newToday);
  }, [snap]);

  // Bar labels must stay short, so "both" uses Vietnamese day names.
  const dayT = useMemo(() => createT(settings.uiLang === 'en' ? 'en' : 'vi'), [settings.uiLang]);
  const dayName = (d: DayStat) => dayT(`day.${new Date(d.start).getDay()}` as TranslationKey);

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <T variant="hero" style={{ color: c.primary }}>
            {due}
          </T>
          <T variant="muted">{t('home.due')}</T>
        </Card>
        <Card style={styles.stat}>
          <T variant="hero" style={{ color: c.success }}>
            {fresh}
          </T>
          <T variant="muted">{t('home.new')}</T>
        </Card>
      </View>

      <Button
        label={t('home.start')}
        onPress={() => router.push('/review')}
        disabled={!snap}
        style={styles.start}
      />
      {snap && !hasWork && (
        <T variant="muted" style={styles.center}>
          {t('home.nothing')}
        </T>
      )}
      <Button kind="secondary" label={t('home.quiz')} onPress={() => router.push('/quiz')} />

      {progress && (
        <Card style={styles.progress}>
          <View style={styles.streakRow}>
            <View style={styles.flex}>
              <T variant="title">
                {progress.streak > 0
                  ? t('home.streak', { n: progress.streak })
                  : t('home.streakNone')}
              </T>
              <T variant="small">
                {progress.activeToday ? t('home.streakDone') : t('home.streakKeep')}
              </T>
            </View>
            <View style={styles.xp}>
              <T variant="title" style={{ color: c.primary }}>
                {progress.xpToday}
              </T>
              <T variant="small">{t('home.xpToday')}</T>
            </View>
          </View>
          <T variant="small">{t('home.week')}</T>
          <WeekChart
            days={progress.week}
            dayLabel={dayName}
            barLabel={(d) =>
              t('home.weekBar', {
                day: dayName(d),
                xp: d.xp,
                reviews: d.reviews,
                quizzes: d.quizzes,
              })
            }
          />
          <T variant="small">{t('home.best', { n: progress.bestStreak, xp: progress.xpTotal })}</T>
        </Card>
      )}

      <Card style={styles.summary}>
        <Row label={t('home.learned')} value={snap?.learned ?? 0} />
        <Row label={t('home.mature')} value={snap?.mature ?? 0} />
        <T variant="small">{t('home.levels', { levels: settings.levels.join(', ') })}</T>
      </Card>

      <View style={styles.links}>
        <Button
          kind="secondary"
          label={t('home.browse')}
          onPress={() => router.push('/browse')}
          style={styles.flex}
        />
        <Button
          kind="secondary"
          label={t('home.settings')}
          onPress={() => router.push('/settings')}
          style={styles.flex}
        />
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.row}>
      <T variant="body">{label}</T>
      <T variant="heading">{value}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  flex: { flex: 1 },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  start: { minHeight: 56 },
  center: { textAlign: 'center' },
  progress: { gap: spacing.md },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  xp: { alignItems: 'flex-end' },
  summary: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  links: { flexDirection: 'row', gap: spacing.md },
});
