import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Card } from '@/db/types';
import { describeInterval, RATINGS, type Rating } from '@/srs';
import { pickNext } from '@/srs/queue';
import { useApp } from '@/state/AppContext';
import { answerCard, loadStudySnapshot, newCard } from '@/state/study';
import { stopSpeaking } from '@/tts';
import { Button, Screen, T } from '@/ui/components/primitives';
import {
  ExampleBlock,
  Meanings,
  SpeakButton,
  spokenForm,
  WordHeadline,
} from '@/ui/components/word';
import { font, radius, spacing, useTheme } from '@/ui/theme';
import type { Word } from '@/vocab/types';

type Current =
  | { kind: 'loading' }
  | { kind: 'card'; card: Card; word: Word; isNew: boolean }
  | { kind: 'done'; nextLearningAt: number | null };

const LEARN_AHEAD_MS = 20 * 60_000;

export default function ReviewScreen() {
  const { repo, settings, scheduler, makeId, t, notifyDataChanged } = useApp();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [current, setCurrent] = useState<Current>({ kind: 'loading' });
  /** Time the card was flipped; also the reference time for interval previews. */
  const [flippedAt, setFlippedAt] = useState<number | null>(null);
  const flipped = flippedAt !== null;
  const flip = useCallback(() => setFlippedAt(Date.now()), []);
  const [counts, setCounts] = useState({ due: 0, fresh: 0 });
  const busy = useRef(false);
  const shownAt = useRef(0);

  const computeNext = useCallback(async () => {
    const now = Date.now();
    const snap = await loadStudySnapshot(repo, settings, now);
    const counts = {
      due: snap.cards.filter((x) => x.phase !== 'new' && x.dueAt <= now).length,
      fresh: snap.newToday,
    };
    const next = pickNext({
      cards: snap.cards,
      unseenWordIds: snap.unseen,
      now,
      newRemaining: snap.newToday,
      learnAheadMs: LEARN_AHEAD_MS,
    });
    let current: Current = { kind: 'done', nextLearningAt: null };
    if (next.type === 'done') {
      current = { kind: 'done', nextLearningAt: next.nextLearningAt };
    } else {
      const card =
        next.type === 'card' ? next.card : newCard(next.wordId, scheduler, now, makeId());
      const word = snap.wordsById.get(card.wordId);
      if (word) current = { kind: 'card', card, word, isNew: card.phase === 'new' };
    }
    return { now, counts, current };
  }, [repo, settings, scheduler, makeId]);

  const apply = useCallback((r: Awaited<ReturnType<typeof computeNext>>) => {
    shownAt.current = r.now;
    setCounts(r.counts);
    setFlippedAt(null);
    setCurrent(r.current);
  }, []);

  const loadNext = useCallback(async () => apply(await computeNext()), [apply, computeNext]);

  useEffect(() => {
    void computeNext().then(apply);
    return stopSpeaking;
  }, [computeNext, apply]);

  // When only learning cards remain, wake up once the next one enters the learn-ahead window.
  useEffect(() => {
    if (current.kind !== 'done' || current.nextLearningAt === null) return;
    const wait = Math.max(1000, current.nextLearningAt - LEARN_AHEAD_MS - Date.now());
    const id = setTimeout(() => void loadNext(), wait);
    return () => clearTimeout(id);
  }, [current, loadNext]);

  const rate = useCallback(
    async (rating: Rating) => {
      if (current.kind !== 'card' || busy.current) return;
      busy.current = true;
      try {
        const now = Date.now();
        await answerCard(repo, scheduler, current.card, rating, now, now - shownAt.current, makeId);
        notifyDataChanged();
        await loadNext();
      } finally {
        busy.current = false;
      }
    },
    [current, repo, scheduler, makeId, loadNext, notifyDataChanged],
  );

  // Desktop shortcuts: Space/Enter flips, 1–4 rate.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (current.kind !== 'card') return;
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        flip();
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        void rate(RATINGS[Number(e.key) - 1]!);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, flipped, flip, rate]);

  if (current.kind === 'loading') return <Screen>{null}</Screen>;

  if (current.kind === 'done') {
    const at = current.nextLearningAt;
    return (
      <Screen contentStyle={styles.doneWrap}>
        <View style={styles.done}>
          <T variant="title" style={styles.center}>
            {t('review.done')}
          </T>
          {at !== null && (
            <T variant="muted" style={styles.center}>
              {t('review.nextLearning', {
                time: new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              })}
            </T>
          )}
          <Button label={t('review.backHome')} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const { card, word, isNew } = current;
  const preview = flippedAt !== null ? scheduler.preview(card, flippedAt) : null;

  return (
    <Screen edges={['left', 'right']} padded={false}>
      <View style={styles.topBar}>
        <T variant="small">{t('review.remaining', { due: counts.due, new: counts.fresh })}</T>
        {isNew && (
          <Text style={[styles.newBadge, { backgroundColor: c.success, color: c.onPrimary }]}>
            {t('review.newBadge')}
          </Text>
        )}
      </View>

      {flipped ? (
        <ScrollView style={styles.flex} contentContainerStyle={styles.cardBody}>
          <WordHeadline word={word} t={t} />
          <View style={styles.centerRow}>
            <SpeakButton text={spokenForm(word)} label={t('review.listen')} />
          </View>
          <Meanings word={word} />
          <ExampleBlock word={word} t={t} />
        </ScrollView>
      ) : (
        // The tap target and the speak button are siblings: nested buttons are invalid on web.
        <View style={[styles.flex, styles.front]}>
          <Pressable
            accessibilityRole="button"
            accessibilityHint={t('review.tapToFlip')}
            onPress={flip}
            style={styles.frontTap}
          >
            <Text selectable={false} style={[styles.frontWord, { color: c.text }]}>
              {word.lemma}
            </Text>
          </Pressable>
          <SpeakButton text={word.lemma} label={t('review.listen')} />
        </View>
      )}

      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(insets.bottom, spacing.md),
            borderTopColor: c.border,
            backgroundColor: c.surface,
          },
        ]}
      >
        {preview ? (
          <View style={styles.ratings}>
            {RATINGS.map((r) => {
              const iv = describeInterval(preview[r], flippedAt!);
              return (
                <Pressable
                  key={r}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(`review.${r}`)}, ${t(`unit.${iv.unit}`, { n: iv.value })}`}
                  onPress={() => void rate(r)}
                  style={({ pressed }) => [
                    styles.rating,
                    { backgroundColor: c.rating[r], opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.ratingLabel, { color: c.onRating }]} numberOfLines={1}>
                    {t(`review.${r}`)}
                  </Text>
                  <Text style={[styles.ratingIvl, { color: c.onRating }]} numberOfLines={1}>
                    {t(`unit.${iv.unit}`, { n: iv.value })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Button label={t('review.tapToFlip')} onPress={flip} style={styles.flip} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  centerRow: { alignItems: 'center' },
  doneWrap: { justifyContent: 'center' },
  done: { gap: spacing.lg, alignItems: 'stretch' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  newBadge: {
    fontSize: font.xs,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  cardBody: { flexGrow: 1, padding: spacing.xl, gap: spacing.xl, justifyContent: 'center' },
  front: { alignItems: 'center', paddingBottom: spacing.xxl },
  frontTap: { flex: 1, alignSelf: 'stretch', justifyContent: 'center', padding: spacing.xl },
  frontWord: { fontSize: 44, fontWeight: '700', textAlign: 'center' },
  bottom: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  ratings: { flexDirection: 'row', gap: spacing.sm },
  rating: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  ratingLabel: { fontSize: font.md, fontWeight: '700' },
  ratingIvl: { fontSize: font.xs, marginTop: 2, opacity: 0.9 },
  flip: { minHeight: 64 },
});
