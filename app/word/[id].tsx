import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Card as StudyCard } from '@/db/types';
import { localeFor } from '@/i18n';
import { useApp } from '@/state/AppContext';
import { addToStudy } from '@/state/study';
import { ConjugationTable } from '@/ui/components/ConjugationTable';
import { Button, Card, Screen, Segmented, T } from '@/ui/components/primitives';
import { PronunciationPanel } from '@/ui/components/PronunciationPanel';
import {
  ExampleBlock,
  Meanings,
  SpeakButton,
  spokenForm,
  WordHeadline,
} from '@/ui/components/word';
import { spacing, useTheme } from '@/ui/theme';
import type { Word } from '@/vocab/types';

export default function WordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repo, scheduler, makeId, t, settings, notifyDataChanged } = useApp();
  const { c } = useTheme();
  const [word, setWord] = useState<Word | null | undefined>(undefined);
  const [card, setCard] = useState<StudyCard | null>(null);

  useEffect(() => {
    if (!id) return;
    void Promise.all([repo.getWord(id), repo.getCardByWordId(id)]).then(([w, cd]) => {
      setWord(w);
      setCard(cd);
    });
  }, [repo, id]);

  if (word === undefined) return <Screen>{null}</Screen>;
  if (word === null) {
    return (
      <Screen>
        <T variant="muted">{t('word.notFound')}</T>
      </Screen>
    );
  }

  const add = async () => {
    setCard(await addToStudy(repo, scheduler, word.id, Date.now(), makeId));
    notifyDataChanged();
  };

  const status = !card
    ? null
    : card.phase === 'new'
      ? t('word.queued')
      : t('word.inStudy', {
          date: new Date(card.dueAt).toLocaleString(localeFor(settings.uiLang), {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });

  return (
    <Screen scroll contentStyle={styles.content}>
      <Stack.Screen options={{ title: word.lemma }} />
      <Card style={styles.head}>
        <WordHeadline word={word} t={t} large />
        <SpeakButton text={spokenForm(word)} label={t('review.listen')} />
        <T variant="small">
          {t(`pos.${word.pos}`)} · {word.level}
        </T>
      </Card>

      <Card style={styles.block}>
        <Meanings word={word} />
      </Card>

      <Card style={styles.block}>
        <T variant="small">{t('word.example')}</T>
        <ExampleBlock word={word} t={t} />
      </Card>

      {word.verb && (
        <Card style={styles.block}>
          <T variant="small">{t('word.verbForms')}</T>
          {(
            [
              [t('word.thirdPerson'), word.verb.thirdPerson],
              [t('word.preterite'), word.verb.preterite],
              [
                t('word.participle'),
                `${word.verb.auxiliary === 'sein' ? 'ist' : 'hat'} ${word.verb.participle}`,
              ],
            ] as const
          ).map(([label, form]) => (
            <View key={label} style={[styles.formRow, { borderBottomColor: c.border }]}>
              <T variant="muted">{label}</T>
              <T variant="heading" selectable>
                {form}
              </T>
            </View>
          ))}
        </Card>
      )}

      <PracticeCard word={word} />

      {word.verb && (
        <Card style={styles.block}>
          <T variant="small">{t('conj.title')}</T>
          <ConjugationTable lemma={word.lemma} verb={word.verb} t={t} />
        </Card>
      )}

      {word.tags.length > 0 && (
        <T variant="small">
          {t('word.tags')}: {word.tags.join(', ')}
        </T>
      )}

      {status ? (
        <T variant="muted" style={styles.center}>
          {status}
        </T>
      ) : (
        <Button label={t('word.addToStudy')} onPress={() => void add()} />
      )}
    </Screen>
  );
}

function PracticeCard({ word }: { word: Word }) {
  const { t } = useApp();
  const [target, setTarget] = useState<'word' | 'sentence'>('word');
  const text = target === 'word' ? spokenForm(word) : word.example.de;
  return (
    <Card style={styles.block}>
      <T variant="small">{t('word.practice')}</T>
      <Segmented
        value={target}
        onChange={setTarget}
        options={[
          { value: 'word', label: t('speak.word') },
          { value: 'sentence', label: t('speak.sentence') },
        ]}
      />
      <PronunciationPanel key={text} text={text} t={t} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  head: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  block: { gap: spacing.md },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  center: { textAlign: 'center' },
});
