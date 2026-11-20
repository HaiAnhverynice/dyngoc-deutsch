import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { font, radius, spacing, TOUCH, useTheme } from '../theme';

/** Safe-area screen with a centred max-width column; `contentStyle` styles that column. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['bottom', 'left', 'right'],
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const outer = [styles.grow, padded && styles.padded];
  const column = [styles.maxWidth, contentStyle];
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: c.bg }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={outer} keyboardShouldPersistTaps="handled">
          <View style={column}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.flex, outer]}>
          <View style={[styles.flex, column]}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

type TextVariant = 'hero' | 'title' | 'heading' | 'body' | 'muted' | 'small';

export function T({
  children,
  variant = 'body',
  style,
  numberOfLines,
  selectable,
}: {
  children: ReactNode;
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  selectable?: boolean;
}) {
  const { c } = useTheme();
  const v: Record<TextVariant, TextStyle> = {
    hero: { fontSize: font.hero, fontWeight: '700', color: c.text },
    title: { fontSize: font.xl, fontWeight: '700', color: c.text },
    heading: { fontSize: font.lg, fontWeight: '600', color: c.text },
    body: { fontSize: font.md, color: c.text },
    muted: { fontSize: font.md, color: c.textMuted },
    small: { fontSize: font.sm, color: c.textMuted },
  };
  return (
    <Text style={[v[variant], style]} numberOfLines={numberOfLines} selectable={selectable}>
      {children}
    </Text>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.primary : kind === 'danger' ? c.danger : c.surfaceAlt;
  const fg = kind === 'secondary' ? c.text : c.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      hitSlop={4}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? c.primary : c.surface,
          borderColor: selected ? c.primary : c.border,
        },
      ]}
    >
      <Text style={{ color: selected ? c.onPrimary : c.text, fontSize: font.sm }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<V extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
}) {
  const { c } = useTheme();
  return (
    <View
      style={[styles.segmented, { backgroundColor: c.surfaceAlt }]}
      accessibilityRole="radiogroup"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, on && { backgroundColor: c.surface }]}
          >
            <Text
              numberOfLines={2}
              style={{
                color: on ? c.text : c.textMuted,
                fontWeight: on ? '600' : '400',
                textAlign: 'center',
                fontSize: font.sm,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({
  value,
  label,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  label: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  const { c } = useTheme();
  const btn = (text: string, next: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text === '−' ? 'decrease' : 'increase'}
      disabled={disabled}
      onPress={() => onChange(next)}
      style={[styles.stepBtn, { backgroundColor: c.surfaceAlt, opacity: disabled ? 0.4 : 1 }]}
    >
      <Text style={{ color: c.text, fontSize: font.xl }}>{text}</Text>
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      {btn('−', Math.max(min, value - step), value <= min)}
      <Text style={[styles.stepLabel, { color: c.text }]}>{label}</Text>
      {btn('+', Math.min(max, value + step), value >= max)}
    </View>
  );
}

export const formatMinute = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Time of day in 30-minute steps, wrapping around midnight. */
export function TimeStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { c } = useTheme();
  const btn = (text: string, delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={delta < 0 ? 'earlier' : 'later'}
      onPress={() => onChange((value + delta + 1440) % 1440)}
      style={[styles.stepBtn, { backgroundColor: c.surfaceAlt }]}
    >
      <Text style={{ color: c.text, fontSize: font.xl }}>{text}</Text>
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      {btn('−', -30)}
      <Text style={[styles.stepLabel, { color: c.text, fontVariant: ['tabular-nums'] }]}>
        {formatMinute(value)}
      </Text>
      {btn('+', 30)}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, style]}>
      {children}
    </View>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <T variant="small" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </T>
      <Card style={styles.sectionCard}>{children}</Card>
    </View>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <T variant="body" style={styles.fieldLabel}>
        {label}
      </T>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  padded: { padding: spacing.lg },
  maxWidth: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  button: {
    minHeight: TOUCH,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: font.md, fontWeight: '600' },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  segmented: { flexDirection: 'row', borderRadius: radius.md, padding: 3 },
  segment: {
    flex: 1,
    minHeight: TOUCH - 6,
    borderRadius: radius.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { minWidth: 90, textAlign: 'center', fontSize: font.md, fontWeight: '600' },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionTitle: { marginBottom: spacing.sm, marginLeft: spacing.xs, letterSpacing: 0.5 },
  sectionCard: { gap: spacing.lg },
  field: { gap: spacing.sm },
  fieldLabel: { fontWeight: '500' },
});
