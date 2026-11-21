import { StyleSheet, Text, View } from 'react-native';
import type { DayStat } from '@/progress';
import { font, radius, spacing, useTheme } from '../theme';

const BAR_AREA = 96;
/** Keeps a single small day from filling the whole chart. */
const MIN_SCALE_XP = 20;

/** Seven-day XP bars drawn with plain Views (no chart library). Today is the last bar. */
export function WeekChart({
  days,
  dayLabel,
  barLabel,
}: {
  days: DayStat[];
  dayLabel: (d: DayStat) => string;
  /** Screen-reader text for one bar. */
  barLabel: (d: DayStat) => string;
}) {
  const { c } = useTheme();
  const max = Math.max(MIN_SCALE_XP, ...days.map((d) => d.xp));
  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const today = i === days.length - 1;
        const h = d.xp > 0 ? Math.max(3, Math.round((d.xp / max) * BAR_AREA)) : 0;
        return (
          <View key={d.start} style={styles.col} accessible accessibilityLabel={barLabel(d)}>
            <View style={styles.barArea}>
              {d.xp > 0 && (
                <Text style={[styles.value, { color: c.textMuted }]} numberOfLines={1}>
                  {d.xp}
                </Text>
              )}
              <View
                style={[
                  styles.bar,
                  { height: h, backgroundColor: c.primary, opacity: today ? 1 : 0.45 },
                ]}
              />
            </View>
            <View style={[styles.base, { backgroundColor: c.border }]} />
            <Text
              style={[
                styles.day,
                { color: today ? c.text : c.textMuted, fontWeight: today ? '700' : '400' },
              ]}
              numberOfLines={1}
            >
              {dayLabel(d)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  col: { flex: 1, alignItems: 'stretch' },
  barArea: { height: BAR_AREA + 18, justifyContent: 'flex-end', alignItems: 'center' },
  value: { fontSize: font.xs, marginBottom: 2, fontVariant: ['tabular-nums'] },
  bar: { width: '70%', borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
  base: { height: StyleSheet.hairlineWidth },
  day: { fontSize: font.xs, textAlign: 'center', marginTop: spacing.xs },
});
