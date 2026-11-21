import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Repository } from '@/db/repository';
import type { UiLanguage } from '@/i18n';
import { XP_QUIZ } from '@/progress';
import { shuffle } from '@/quiz/random';
import type { QuizResult } from '@/quiz/types';
import { useApp } from '@/state/AppContext';
import { saveQuizAnswer } from '@/state/quiz';
import type { IdFactory, StudySnapshot } from '@/state/study';
import { useStudySnapshot } from '@/state/useStudySnapshot';
import { Button, Card, Screen, Segmented, T } from '@/ui/components/primitives';
import { PronunciationPanel } from '@/ui/components/PronunciationPanel';
import { spokenForm, WordHeadline } from '@/ui/components/word';
import { font, radius, spacing, TOUCH, useTheme } from '@/ui/theme';
import type { Word } from '@/vocab/types';

const SESSION = 10;
const RATINGS: QuizResult[] = ['correct', 'close', 'wrong'];

/** Words being studied first (that is what you need to say), then the selected levels. */
function pickWords(snap: StudySnapshot, levels: string[]): Word[] {
  const studied = new Set(snap.cards.filter((c) => c.phase !== 'new').map((c) => c.wordId));
  const first = shuffle(
    snap.words.filter((w) => studied.has(w.id)),
    Math.random,
  );
  const rest = shuffle(
    snap.words.filter((w) => !studied.has(w.id) && levels.includes(w.level)),
    Math.random,
  );
  return [...first, ...rest].slice(0, SESSION);
}

/** Self-assessment counts for XP/streak like a quiz answer. */
function logSpeaking(
  repo: Repository,
  wordId: string,
  result: QuizResult,
  makeId: IdFactory,
  done: () => void,
) {
  saveQuizAnswer(repo, { type: 'speaking', wordId }, result, Date.now(), null, makeId)
    .then(done)
    .catch((e: unknown) => console.warn('speaking log failed', e));
}

const meaning = (w: Word, lang: UiLanguage) =>
  lang === 'vi' ? w.vi : lang === 'en' ? w.en : `${w.vi} · ${w.en}`;
const translation = (w: Word, lang: UiLanguage) =>
  lang === 'vi' ? w.example.vi : lang === 'en' ? w.example.en : `${w.example.vi}\n${w.example.en}`;

export default function SpeakScreen() {
  const { repo, makeId, t, settings, notifyDataChanged } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const { snap } = useStudySnapshot();
  const [words, setWords] = useState<Word[] | null>(null);
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<'word' | 'sentence'>('word');
  const [recorded, setRecorded] = useState(false);
  const [xp, setXp] = useState(0);

  if (!snap) return <Screen>{null}</Screen>;
  const list = words ?? pickWords(snap, settings.levels);
  if (!words && list.length > 0) setWords(list);

  if (list.length === 0) {
    return (
      <Screen>
        <T variant="muted">{t('speak.empty')}</T>
      </Screen>
    );
  }

  if (index >= list.length) {
    return (
      <Screen contentStyle={styles.done}>
        <T variant="title" style={styles.center}>
          {t('speak.done', { xp })}
        </T>
        <Button
          label={t('speak.again')}
          onPress={() => {
            setWords(pickWords(snap, settings.levels));
            setIndex(0);
            setXp(0);
          }}
        />
        <Button kind="secondary" label={t('quiz.home')} onPress={() => router.back()} />
      </Screen>
    );
  }

  const word = list[index]!;
  const text = target === 'word' ? spokenForm(word) : word.example.de;

  const next = (result: QuizResult | null) => {
    if (result) {
      logSpeaking(repo, word.id, result, makeId, notifyDataChanged);
      setXp((x) => x + XP_QUIZ[result]);
    }
    setRecorded(false);
    setIndex((i) => i + 1);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <T variant="small">
        {t('speak.progress', { i: index + 1, n: list.length })} · {t('speak.hint')}
      </T>
      <Segmented
        value={target}
        onChange={(v) => {
          setTarget(v);
          setRecorded(false);
        }}
        options={[
          { value: 'word', label: t('speak.word') },
          { value: 'sentence', label: t('speak.sentence') },
        ]}
      />
      <Card style={styles.card}>
        {target === 'word' ? (
          <>
            <WordHeadline word={word} t={t} showPlural={false} />
            <T variant="muted" style={styles.center}>
              {meaning(word, settings.uiLang)}
            </T>
          </>
        ) : (
          <>
            <T variant="title" style={[styles.center, styles.italic]}>
              {word.example.de}
            </T>
            <T variant="muted" style={styles.center}>
              {translation(word, settings.uiLang)}
            </T>
          </>
        )}
      </Card>
      <PronunciationPanel key={text} text={text} t={t} onRecorded={() => setRecorded(true)} />
      <T variant="heading" style={styles.center}>
        {t('speak.rateQ')}
      </T>
      <View style={styles.ratings}>
        {RATINGS.map((r) => (
          <Pressable
            key={r}
            accessibilityRole="button"
            accessibilityState={{ disabled: !recorded }}
            disabled={!recorded}
            onPress={() => next(r)}
            style={({ pressed }) => [
              styles.rating,
              {
                backgroundColor:
                  c.rating[r === 'correct' ? 'good' : r === 'close' ? 'hard' : 'again'],
                opacity: !recorded ? 0.35 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.ratingText, { color: c.onRating }]}>{t(`speak.rate.${r}`)}</Text>
          </Pressable>
        ))}
      </View>
      <Button kind="secondary" label={t('speak.skip')} onPress={() => next(null)} />
      <T variant="small" style={styles.center}>
        {t('speak.privacy')}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  done: { justifyContent: 'center', gap: spacing.lg },
  center: { textAlign: 'center' },
  italic: { fontStyle: 'italic' },
  card: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  ratings: { flexDirection: 'row', gap: spacing.sm },
  rating: {
    flex: 1,
    minHeight: TOUCH + 8,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: { fontSize: font.md, fontWeight: '700' },
});
