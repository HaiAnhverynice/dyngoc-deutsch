import { Pressable, StyleSheet, Text, View } from 'react-native';
import { speakGerman } from '@/tts';
import type { TFunction } from '@/i18n';
import type { Article, Word } from '@/vocab/types';
import { font, radius, spacing, TOUCH, useTheme } from '../theme';
import { T } from './primitives';

/** Colour + the article text itself, so meaning never depends on colour alone. */
export function ArticleBadge({ article, size = 'md' }: { article: Article; size?: 'sm' | 'md' }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: c.genderBg[article], borderColor: c.gender[article] },
      ]}
      accessibilityLabel={`Artikel ${article}`}
    >
      <Text
        style={{
          color: c.gender[article],
          fontWeight: '700',
          fontSize: size === 'sm' ? font.xs : font.sm,
        }}
      >
        {article}
      </Text>
    </View>
  );
}

export function SpeakButton({ text, label }: { text: string; label: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${text}`}
      onPress={() => speakGerman(text)}
      hitSlop={6}
      style={({ pressed }) => [
        styles.speak,
        { backgroundColor: c.surfaceAlt, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={{ fontSize: font.lg }}>🔊</Text>
    </Pressable>
  );
}

/** Spoken form includes the article: "der Tisch". */
export const spokenForm = (w: Pick<Word, 'article' | 'lemma'>) =>
  w.article ? `${w.article} ${w.lemma}` : w.lemma;

/** Article badge + lemma in gender colour, plus plural line for nouns. */
export function WordHeadline({
  word,
  t,
  large = false,
  showPlural = true,
}: {
  word: Word;
  t: TFunction;
  large?: boolean;
  showPlural?: boolean;
}) {
  const { c } = useTheme();
  const color = word.article ? c.gender[word.article] : c.text;
  return (
    <View style={styles.headline}>
      <View style={styles.headRow}>
        {word.article && <ArticleBadge article={word.article} />}
        <Text
          selectable
          style={[
            { fontSize: large ? font.hero : font.xxl, fontWeight: '700', color },
            styles.lemma,
          ]}
        >
          {word.lemma}
        </Text>
      </View>
      {showPlural && word.pos === 'noun' && (
        <T variant="muted">
          {t('word.plural')}: {word.plural ? `die ${word.plural}` : `— (${t('word.noPlural')})`}
        </T>
      )}
    </View>
  );
}

export function Meanings({ word }: { word: Word }) {
  const { c } = useTheme();
  const tag = (s: string) => (
    <Text style={[styles.langTag, { color: c.textMuted, borderColor: c.border }]}>{s}</Text>
  );
  return (
    <View style={styles.meanings}>
      <View style={styles.meaningRow}>
        {tag('VI')}
        <T variant="title" style={styles.flex1} selectable>
          {word.vi}
        </T>
      </View>
      <View style={styles.meaningRow}>
        {tag('EN')}
        <T variant="heading" style={[styles.en, styles.flex1]} selectable>
          {word.en}
        </T>
      </View>
    </View>
  );
}

export function ExampleBlock({ word, t }: { word: Word; t: TFunction }) {
  const { c } = useTheme();
  return (
    <View style={[styles.example, { borderLeftColor: c.border }]}>
      <View style={styles.exampleRow}>
        <T variant="body" style={styles.exampleDe} selectable>
          {word.example.de}
        </T>
        <SpeakButton text={word.example.de} label={t('review.listen')} />
      </View>
      {!!word.example.vi && (
        <T variant="muted" selectable>
          {word.example.vi}
        </T>
      )}
      {!!word.example.en && (
        <T variant="small" selectable>
          {word.example.en}
        </T>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeSm: { paddingHorizontal: 6, paddingVertical: 1 },
  speak: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: { gap: spacing.xs, alignItems: 'center' },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  lemma: { textAlign: 'center' },
  meanings: { gap: spacing.sm },
  meaningRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  langTag: {
    fontSize: font.xs,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  flex1: { flex: 1 },
  en: { fontWeight: '400' },
  example: { borderLeftWidth: 3, paddingLeft: spacing.md, gap: spacing.xs },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  exampleDe: { flex: 1, fontSize: font.lg, fontStyle: 'italic' },
});
