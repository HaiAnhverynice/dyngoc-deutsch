import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { exerciseKey } from '@/grammar/progress';
import { GAP, type Bilingual, type Exercise, type Lesson, type LessonBlock } from '@/grammar/types';
import type { TFunction, UiLanguage } from '@/i18n';
import { XP_QUIZ } from '@/progress';
import type { QuizResult } from '@/quiz/types';
import { font, radius, spacing, TOUCH, useTheme } from '../theme';
import { Button, Card, T } from './primitives';
import { SpeakButton } from './word';

/** Vietnamese, English or both, following the UI language setting. */
export const pick = (b: Bilingual, lang: UiLanguage): string[] =>
  lang === 'vi' ? [b.vi] : lang === 'en' ? [b.en] : [b.vi, b.en];

function BiText({ b, lang, strong = false }: { b: Bilingual; lang: UiLanguage; strong?: boolean }) {
  return (
    <View style={styles.gapXs}>
      {pick(b, lang).map((line, i) => (
        <T key={i} variant={i === 0 ? (strong ? 'heading' : 'body') : 'small'} selectable>
          {line}
        </T>
      ))}
    </View>
  );
}

/** Rough column width from the longest cell so tables line up without a table layout engine. */
const columnWidths = (head: string[], rows: string[][]) =>
  head.map((h, i) => {
    const longest = Math.max(h.length, ...rows.map((r) => r[i]?.length ?? 0));
    return Math.min(240, Math.max(64, longest * 8.5 + 20));
  });

function TableBlock({
  block,
  lang,
}: {
  block: Extract<LessonBlock, { type: 'table' }>;
  lang: UiLanguage;
}) {
  const { c } = useTheme();
  const widths = columnWidths(block.head, block.rows);
  const hasHead = block.head.some((h) => h.length > 0);
  const cell = (text: string, i: number, header: boolean) => (
    <Text
      key={i}
      selectable
      style={[
        styles.cell,
        {
          width: widths[i],
          color: header ? c.textMuted : c.text,
          fontWeight: header || i === 0 ? '700' : '400',
        },
      ]}
    >
      {text}
    </Text>
  );
  return (
    <View style={styles.gapXs}>
      {block.caption && <BiText b={block.caption} lang={lang} strong />}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={[styles.table, { borderColor: c.border }]}>
          {hasHead && (
            <View style={[styles.tr, { backgroundColor: c.surfaceAlt }]}>
              {block.head.map((h, i) => cell(h, i, true))}
            </View>
          )}
          {block.rows.map((r, j) => (
            <View
              key={j}
              style={[
                styles.tr,
                {
                  borderTopColor: c.border,
                  borderTopWidth: j || hasHead ? StyleSheet.hairlineWidth : 0,
                },
              ]}
            >
              {r.map((x, i) => cell(x, i, false))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function LessonBlocks({
  lesson,
  lang,
  t,
}: {
  lesson: Lesson;
  lang: UiLanguage;
  t: TFunction;
}) {
  const { c } = useTheme();
  return (
    <>
      {lesson.blocks.map((b, i) => {
        switch (b.type) {
          case 'text':
            return <BiText key={i} b={b} lang={lang} />;
          case 'tip':
            return (
              <View
                key={i}
                style={[styles.tip, { borderLeftColor: c.primary, backgroundColor: c.surfaceAlt }]}
              >
                <T variant="small" style={{ fontWeight: '700' }}>
                  💡 {t('grammar.tip')}
                </T>
                <BiText b={b} lang={lang} />
              </View>
            );
          case 'table':
            return <TableBlock key={i} block={b} lang={lang} />;
          case 'examples':
            return (
              <Card key={i} style={styles.gapMd}>
                {b.items.map((x, j) => (
                  <View key={j} style={styles.example}>
                    <View style={styles.flex}>
                      <T variant="body" style={styles.de} selectable>
                        {x.de}
                      </T>
                      {pick(x, lang).map((line, k) => (
                        <T key={k} variant="small" selectable>
                          {line}
                        </T>
                      ))}
                    </View>
                    <SpeakButton text={x.de} label={t('review.listen')} />
                  </View>
                ))}
              </Card>
            );
        }
      })}
    </>
  );
}

type Answers = Record<string, number>;

/** Gap-fill exercises; every answer is reported once via `onAnswer` (for XP/streak logs). */
export function Exercises({
  lesson,
  lang,
  t,
  onAnswer,
}: {
  lesson: Lesson;
  lang: UiLanguage;
  t: TFunction;
  onAnswer: (key: string, result: QuizResult) => void;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const done = lesson.exercises.every((e) => answers[e.id] !== undefined);
  const ok = lesson.exercises.filter((e) => answers[e.id] === e.answer).length;

  const choose = (e: Exercise, i: number) => {
    if (answers[e.id] !== undefined) return;
    setAnswers((a) => ({ ...a, [e.id]: i }));
    onAnswer(exerciseKey(lesson.id, e.id), i === e.answer ? 'correct' : 'wrong');
  };

  return (
    <View style={styles.gapLg}>
      <T variant="title">{t('grammar.exercises')}</T>
      <T variant="small">{t('grammar.exerciseHint')}</T>
      {lesson.exercises.map((e, n) => (
        <ExerciseCard
          key={e.id}
          n={n + 1}
          e={e}
          chosen={answers[e.id]}
          onChoose={(i) => choose(e, i)}
          lang={lang}
          t={t}
        />
      ))}
      {done && (
        <Card style={styles.gapMd}>
          <T variant="title" style={styles.center}>
            {t('grammar.score', { ok, n: lesson.exercises.length })}
          </T>
          <Button kind="secondary" label={t('grammar.retry')} onPress={() => setAnswers({})} />
        </Card>
      )}
    </View>
  );
}

/** Multiple-choice card with per-choice ✓/✗ feedback and an explanation (grammar and reading). */
export function ChoiceCard({
  prompt,
  choices,
  answer,
  chosen,
  onChoose,
  explain,
  lang,
  t,
}: {
  /** Rendered above the choices; receives the answered state to fill gaps. */
  prompt: (answered: boolean, right: boolean) => ReactNode;
  choices: string[];
  answer: number;
  chosen: number | undefined;
  onChoose: (i: number) => void;
  explain: Bilingual;
  lang: UiLanguage;
  t: TFunction;
}) {
  const { c } = useTheme();
  const answered = chosen !== undefined;
  const right = chosen === answer;
  const result: QuizResult = right ? 'correct' : 'wrong';
  return (
    <Card style={styles.gapMd}>
      {prompt(answered, right)}
      <View style={styles.choices}>
        {choices.map((choice, i) => {
          const isAnswer = i === answer;
          const isChosen = i === chosen;
          const border =
            answered && isAnswer ? c.success : answered && isChosen ? c.danger : c.border;
          const mark = answered && isAnswer ? ' ✓' : answered && isChosen ? ' ✗' : '';
          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              accessibilityLabel={choice + mark}
              disabled={answered}
              onPress={() => onChoose(i)}
              style={({ pressed }) => [
                styles.choice,
                {
                  borderColor: border,
                  borderWidth: answered && (isAnswer || isChosen) ? 2 : 1,
                  backgroundColor: c.surface,
                  opacity: answered && !isAnswer && !isChosen ? 0.5 : pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: c.text, fontSize: font.lg }}>
                {choice}
                {mark}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {answered && (
        <View style={styles.gapXs}>
          <T variant="heading" style={{ color: right ? c.success : c.danger }}>
            {t(`quiz.${result}`, { xp: XP_QUIZ[result] })}
          </T>
          <BiText b={explain} lang={lang} />
        </View>
      )}
    </Card>
  );
}

function ExerciseCard({
  n,
  e,
  chosen,
  onChoose,
  lang,
  t,
}: {
  n: number;
  e: Exercise;
  chosen: number | undefined;
  onChoose: (i: number) => void;
  lang: UiLanguage;
  t: TFunction;
}) {
  const { c } = useTheme();
  const [before, after] = e.de.split(GAP) as [string, string];
  return (
    <ChoiceCard
      choices={e.choices}
      answer={e.answer}
      chosen={chosen}
      onChoose={onChoose}
      explain={e.explain}
      lang={lang}
      t={t}
      prompt={(answered, right) => (
        <Text style={[styles.sentence, { color: c.text }]}>
          <Text style={{ color: c.textMuted }}>{n}. </Text>
          {before}
          <Text
            style={{
              fontWeight: '700',
              color: !answered ? c.textMuted : right ? c.success : c.danger,
            }}
          >
            {answered ? e.choices[chosen!] : '_____'}
          </Text>
          {after}
        </Text>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  gapXs: { gap: spacing.xs },
  gapMd: { gap: spacing.md },
  gapLg: { gap: spacing.lg },
  tip: { borderLeftWidth: 4, borderRadius: radius.sm, padding: spacing.md, gap: spacing.xs },
  table: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.sm, overflow: 'hidden' },
  tr: { flexDirection: 'row' },
  cell: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: font.sm },
  example: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  de: { fontStyle: 'italic', fontWeight: '600' },
  sentence: { fontSize: font.lg, lineHeight: 28 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: {
    minHeight: TOUCH,
    minWidth: 72,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
