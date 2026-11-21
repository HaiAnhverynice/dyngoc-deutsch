import { READING_FILE } from '@content/index';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { Repository } from '@/db/repository';
import type { UiLanguage } from '@/i18n';
import type { QuizResult } from '@/quiz/types';
import { questionKey } from '@/reading/progress';
import type { ReadingItem, ReadingLine } from '@/reading/types';
import { useApp } from '@/state/AppContext';
import { saveQuizAnswer } from '@/state/quiz';
import type { IdFactory } from '@/state/study';
import { speakGerman, stopSpeaking } from '@/tts';
import { ChoiceCard, pick } from '@/ui/components/Lesson';
import { Button, Card, Chip, Screen, T } from '@/ui/components/primitives';
import { PronunciationPanel } from '@/ui/components/PronunciationPanel';
import { font, radius, spacing, useTheme } from '@/ui/theme';

const ITEMS = new Map(READING_FILE.items.map((i) => [i.id, i]));
/** Different TTS pitch per speaker so dialogues are easier to follow. */
const PITCHES = [1.0, 1.25, 0.85, 1.1];

const translationOf = (l: ReadingLine, lang: UiLanguage) => pick(l, lang);

function logAnswer(
  repo: Repository,
  key: string,
  result: QuizResult,
  makeId: IdFactory,
  done: () => void,
) {
  saveQuizAnswer(repo, { type: 'reading', wordId: key }, result, Date.now(), null, makeId)
    .then(done)
    .catch((e: unknown) => console.warn('reading log failed', e));
}

export default function ReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = id ? ITEMS.get(id) : undefined;
  const { t } = useApp();
  if (!item) {
    return (
      <Screen>
        <T variant="muted">{t('reading.notFound')}</T>
      </Screen>
    );
  }
  return <ReadingView key={item.id} item={item} />;
}

function ReadingView({ item }: { item: ReadingItem }) {
  const { repo, makeId, t, settings, notifyDataChanged } = useApp();
  const { c } = useTheme();
  const lang = settings.uiLang;
  const speakers = [...new Set(item.lines.map((l) => l.speaker).filter((s): s is string => !!s))];
  const pitchOf = (l: ReadingLine) => PITCHES[Math.max(0, speakers.indexOf(l.speaker ?? ''))] ?? 1;

  const [showTranslations, setShowTranslations] = useState(false);
  const [hiddenRole, setHiddenRole] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  /** Bumped to cancel a running "play all" chain. */
  const run = useRef(0);

  const stopAll = useCallback(() => {
    run.current++;
    stopSpeaking();
    setPlaying(null);
  }, []);
  useEffect(() => stopAll, [stopAll]);

  const playFrom = (i: number, token: number) => {
    if (token !== run.current) return;
    const line = item.lines[i];
    if (!line) {
      setPlaying(null);
      return;
    }
    setPlaying(i);
    speakGerman(line.de, { pitch: pitchOf(line), onDone: () => playFrom(i + 1, token) });
  };
  const playAll = () => {
    stopAll();
    const token = run.current;
    playFrom(0, token);
  };

  const color = (speaker?: string) =>
    [c.primary, c.gender.die, c.gender.das, c.rating.hard][speakers.indexOf(speaker ?? '')] ??
    c.text;

  return (
    <Screen scroll contentStyle={styles.content}>
      <Stack.Screen options={{ title: pick(item.title, lang)[0] }} />
      <T variant="small">
        {item.level} · {t(item.kind === 'dialogue' ? 'reading.dialogue' : 'reading.text')}
      </T>
      <T variant="title">{pick(item.title, lang).join(' / ')}</T>
      <T variant="muted">{pick(item.intro, lang)[0]}</T>

      <Card style={styles.gapMd}>
        <Button
          label={playing === null ? `🔊 ${t('reading.playAll')}` : `⏹ ${t('reading.stopAll')}`}
          onPress={playing === null ? playAll : stopAll}
        />
        <View style={styles.switchRow}>
          <T variant="body" style={styles.flex}>
            {t('reading.translations')}
          </T>
          <Switch value={showTranslations} onValueChange={setShowTranslations} />
        </View>
        {item.kind === 'dialogue' && (
          <View style={styles.gapXs}>
            <T variant="small">{t('reading.hideRole')}</T>
            <View style={styles.chips}>
              {speakers.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={hiddenRole === s}
                  onPress={() => setHiddenRole(s)}
                />
              ))}
              <Chip
                label={t('reading.noRole')}
                selected={hiddenRole === null}
                onPress={() => setHiddenRole(null)}
              />
            </View>
            {hiddenRole && <T variant="small">{t('reading.roleHint')}</T>}
          </View>
        )}
        {!hiddenRole && <T variant="small">{t('reading.tapLine')}</T>}
      </Card>

      <View style={styles.gapSm}>
        {item.lines.map((line, i) => {
          const isOpen = open === i;
          const hidden = !!hiddenRole && line.speaker === hiddenRole && !isOpen;
          return (
            <View
              key={i}
              style={[
                styles.line,
                {
                  backgroundColor: playing === i ? c.surfaceAlt : c.surface,
                  borderColor: isOpen ? c.primary : c.border,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                onPress={() => setOpen(isOpen ? null : i)}
                style={styles.gapXs}
              >
                {line.speaker && (
                  <Text style={[styles.speaker, { color: color(line.speaker) }]}>
                    {line.speaker}
                  </Text>
                )}
                <Text
                  selectable={!hidden}
                  style={[styles.de, { color: hidden ? c.textMuted : c.text }]}
                >
                  {hidden ? t('reading.yourTurn') : line.de}
                </Text>
                {(showTranslations || isOpen || hidden) &&
                  translationOf(line, lang).map((tr, k) => (
                    <T key={k} variant="small">
                      {tr}
                    </T>
                  ))}
              </Pressable>
              {isOpen && (
                <PronunciationPanel key={line.de} text={line.de} t={t} pitch={pitchOf(line)} />
              )}
            </View>
          );
        })}
      </View>

      {item.glossary.length > 0 && (
        <Card style={styles.gapSm}>
          <T variant="heading">{t('reading.glossary')}</T>
          {item.glossary.map((g) => (
            <View key={g.de} style={styles.glossRow}>
              <Text style={[styles.glossDe, { color: c.text }]}>{g.de}</Text>
              <T variant="small" style={styles.flex}>
                {pick(g, lang).join(' · ')}
              </T>
            </View>
          ))}
        </Card>
      )}

      <T variant="title">{t('reading.questions')}</T>
      {item.questions.map((q, n) => (
        <ChoiceCard
          key={q.id}
          choices={q.choices}
          answer={q.answer}
          chosen={answers[q.id]}
          onChoose={(i) => {
            if (answers[q.id] !== undefined) return;
            setAnswers((a) => ({ ...a, [q.id]: i }));
            logAnswer(
              repo,
              questionKey(item.id, q.id),
              i === q.answer ? 'correct' : 'wrong',
              makeId,
              notifyDataChanged,
            );
          }}
          explain={q.explain}
          lang={lang}
          t={t}
          prompt={() => (
            <View style={styles.gapXs}>
              <Text style={[styles.question, { color: c.text }]}>
                {n + 1}. {q.de}
              </Text>
              {pick(q, lang).map((tr, k) => (
                <T key={k} variant="small">
                  {tr}
                </T>
              ))}
            </View>
          )}
        />
      ))}
      {Object.keys(answers).length === item.questions.length && (
        <Button kind="secondary" label={t('grammar.retry')} onPress={() => setAnswers({})} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  flex: { flex: 1 },
  gapXs: { gap: spacing.xs },
  gapSm: { gap: spacing.sm },
  gapMd: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  speaker: { fontSize: font.sm, fontWeight: '700' },
  de: { fontSize: font.lg, lineHeight: 26 },
  question: { fontSize: font.lg, fontWeight: '600' },
  glossRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'baseline' },
  glossDe: { fontSize: font.md, fontWeight: '600', minWidth: 120 },
});
