import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useApp } from '@/state/AppContext';
import { useStudySnapshot } from '@/state/useStudySnapshot';
import { Button, Card, Screen, T } from '@/ui/components/primitives';
import { spacing, useTheme } from '@/ui/theme';

export default function HomeScreen() {
  const { t, settings } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const { snap } = useStudySnapshot();

  const due = snap?.dueToday ?? 0;
  const fresh = snap?.newToday ?? 0;
  const hasWork = due + fresh > 0;

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
          style={styles.link}
        />
        <Button
          kind="secondary"
          label={t('home.settings')}
          onPress={() => router.push('/settings')}
          style={styles.link}
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
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  start: { minHeight: 56 },
  center: { textAlign: 'center' },
  summary: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  links: { flexDirection: 'row', gap: spacing.md },
  link: { flex: 1 },
});
