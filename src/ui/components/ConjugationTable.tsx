import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { conjugate, PERSONS } from '@/grammar/conjugate';
import type { TFunction } from '@/i18n';
import { speakGerman } from '@/tts';
import type { VerbForms } from '@/vocab/types';
import { font, spacing, useTheme } from '../theme';
import { Chip, T } from './primitives';

type Tense = 'present' | 'preterite' | 'perfect' | 'future' | 'imperative';
const TENSES: Tense[] = ['present', 'preterite', 'perfect', 'future', 'imperative'];
const IMPERATIVE_PERSONS = ['du', 'ihr', 'Sie'];

/** Speakable text: first pronoun variant, optional "(e)" spelled out. */
const spoken = (person: string, form: string) =>
  `${person.split('/')[0]} ${form}`.replace('(e)', 'e');

export function ConjugationTable({
  lemma,
  verb,
  t,
}: {
  lemma: string;
  verb: VerbForms;
  t: TFunction;
}) {
  const { c } = useTheme();
  const [tense, setTense] = useState<Tense>('present');
  const conj = useMemo(() => conjugate(lemma, verb), [lemma, verb]);

  let rows: { person: string; form: string; say: string; bold: boolean }[];
  if (tense === 'imperative') {
    rows = (conj.imperative ?? []).map((form, i) => ({
      person: IMPERATIVE_PERSONS[i]!,
      form: `${form}!`,
      // "Sie" belongs inside the form ("fahren Sie!"); du/ihr are not spoken.
      say: form.replace('(e)', 'e'),
      bold: false,
    }));
  } else {
    rows = conj[tense].map((form, i) => ({
      person: PERSONS[i]!,
      form,
      say: spoken(PERSONS[i]!, form),
      bold: tense === 'present' && conj.irregularPresent.includes(i),
    }));
  }

  const hint =
    tense === 'imperative'
      ? conj.imperative
        ? t('conj.imperativeHint')
        : t('conj.noImperative')
      : tense === 'present' && conj.irregularPresent.length > 0
        ? t('conj.irregularHint')
        : t('conj.tapHint');

  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        {TENSES.map((x) => (
          <Chip key={x} label={t(`conj.${x}`)} selected={tense === x} onPress={() => setTense(x)} />
        ))}
      </View>
      {rows.map((r) => (
        <Pressable
          key={r.person}
          accessibilityRole="button"
          accessibilityLabel={r.say}
          onPress={() => speakGerman(r.say)}
          style={({ pressed }) => [
            styles.row,
            { borderBottomColor: c.border, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.person, { color: c.textMuted }]}>
            {tense === 'imperative' ? `(${r.person})` : r.person}
          </Text>
          <Text
            selectable
            style={[styles.form, { color: c.text, fontWeight: r.bold ? '800' : '500' }]}
          >
            {r.form}
          </Text>
        </Pressable>
      ))}
      <T variant="small">{hint}</T>
      <T variant="small">{t('conj.generated')}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  person: { width: 92, fontSize: font.md },
  form: { flex: 1, fontSize: font.lg },
});
