import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TFunction, UiLanguage } from '@/i18n';
import { XP_QUIZ } from '@/progress';
import { gradeChoice, gradeOrder, gradeSpelling, isPass } from '@/quiz/build';
import { QUIZ_TYPES, type Question, type QuizResult, type QuizType } from '@/quiz/types';
import { useApp } from '@/state/AppContext';
import { createQuizSession, saveQuizAnswer } from '@/state/quiz';
import { QUIZ_LENGTHS } from '@/state/settings';
import { useStudySnapshot } from '@/state/useStudySnapshot';
import { speakGerman, stopSpeaking } from '@/tts';
import { Button, Card, Chip, Screen, Section, Segmented, T } from '@/ui/components/primitives';
import { ArticleBadge, SpeakButton, spokenForm, WordHeadline } from '@/ui/components/word';
import { font, radius, spacing, TOUCH, useTheme } from '@/ui/theme';
import { ARTICLES, type Article, type Word } from '@/vocab/types';

interface Answer {
  result: QuizResult;
  /** Choice id / article / typed text, used to colour the chosen option. */
  given: string;
}

type Phase =
  | { kind: 'setup'; empty: boolean }
  | { kind: 'run'; questions: Question[]; index: number; answers: Answer[] }
  | { kind: 'summary'; questions: Question[]; answers: Answer[] };

const UMLAUTS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

const meaningLines = (w: Word, lang: UiLanguage) =>
  lang === 'vi' ? [w.vi] : lang === 'en' ? [w.en] : [w.vi, w.en];

const translationLines = (w: Word, lang: UiLanguage) =>
  (lang === 'vi'
    ? [w.example.vi]
    : lang === 'en'
      ? [w.example.en]
      : [w.example.vi, w.example.en]
  ).filter((s) => !!s);

/** Full sentence of an order question, as the learner should have built it. */
const orderSentence = (q: Extract<Question, { type: 'order' }>) =>
  q.solution.join(' ') + q.punctuation;

export default function QuizScreen() {
  const { repo, settings, updateSettings, makeId, t, notifyDataChanged } = useApp();
  const { snap } = useStudySnapshot();
  const [phase, setPhase] = useState<Phase>({ kind: 'setup', empty: false });
  const shownAt = useRef(0);

  useEffect(() => stopSpeaking, []);

  const start = () => {
    if (!snap) return;
    const qs = createQuizSession(
      snap,
      settings,
      settings.quiz.types,
      settings.quiz.length,
      Math.random,
    );
    shownAt.current = Date.now();
    setPhase(
      qs.length === 0
        ? { kind: 'setup', empty: true }
        : { kind: 'run', questions: qs, index: 0, answers: [] },
    );
  };

  const answer = useCallback(
    (result: QuizResult, given: string) => {
      if (phase.kind !== 'run' || phase.answers.length > phase.index) return;
      const q = phase.questions[phase.index]!;
      const now = Date.now();
      saveQuizAnswer(repo, q, result, now, now - shownAt.current, makeId).catch((e: unknown) =>
        console.warn('quiz log failed', e),
      );
      setPhase({ ...phase, answers: [...phase.answers, { result, given }] });
    },
    [phase, repo, makeId],
  );

  const next = useCallback(() => {
    if (phase.kind !== 'run' || phase.answers.length <= phase.index) return;
    stopSpeaking();
    if (phase.index + 1 >= phase.questions.length) {
      notifyDataChanged();
      setPhase({ kind: 'summary', questions: phase.questions, answers: phase.answers });
    } else {
      shownAt.current = Date.now();
      setPhase({ ...phase, index: phase.index + 1 });
    }
  }, [phase, notifyDataChanged]);

  if (phase.kind === 'setup') {
    const toggle = (type: QuizType) => {
      const on = settings.quiz.types.includes(type);
      const types = on
        ? settings.quiz.types.filter((x) => x !== type)
        : QUIZ_TYPES.filter((x) => x === type || settings.quiz.types.includes(x));
      if (types.length > 0) void updateSettings({ quiz: { ...settings.quiz, types } });
    };
    return (
      <Screen scroll>
        <Section title={t('quiz.types')}>
          <View style={styles.wrap}>
            {QUIZ_TYPES.map((type) => (
              <Chip
                key={type}
                label={t(`quiz.type.${type}`)}
                selected={settings.quiz.types.includes(type)}
                onPress={() => toggle(type)}
              />
            ))}
          </View>
        </Section>
        <Section title={t('quiz.length')}>
          <Segmented
            options={QUIZ_LENGTHS.map((n) => ({ value: String(n), label: String(n) }))}
            value={String(settings.quiz.length)}
            onChange={(v) => void updateSettings({ quiz: { ...settings.quiz, length: Number(v) } })}
          />
        </Section>
        <T variant="small" style={styles.hint}>
          {t('quiz.setupHint')}
        </T>
        {phase.empty && (
          <T variant="body" style={[styles.hint, styles.center]}>
            {t('quiz.notEnough')}
          </T>
        )}
        <Button label={t('quiz.start')} onPress={start} disabled={!snap} style={styles.big} />
      </Screen>
    );
  }

  if (!snap) return <Screen>{null}</Screen>;
  if (phase.kind === 'summary') {
    return (
      <Summary
        phase={phase}
        words={snap.wordsById}
        onAgain={() => setPhase({ kind: 'setup', empty: false })}
      />
    );
  }

  const q = phase.questions[phase.index]!;
  const word = snap.wordsById.get(q.wordId);
  if (!word) return <Screen>{null}</Screen>;
  return (
    <RunView
      key={phase.index}
      q={q}
      word={word}
      words={snap.wordsById}
      index={phase.index}
      total={phase.questions.length}
      answer={phase.answers[phase.index] ?? null}
      onAnswer={answer}
      onNext={next}
      t={t}
      lang={settings.uiLang}
    />
  );
}

function RunView({
  q,
  word,
  words,
  index,
  total,
  answer,
  onAnswer,
  onNext,
  t,
  lang,
}: {
  q: Question;
  word: Word;
  words: Map<string, Word>;
  index: number;
  total: number;
  answer: Answer | null;
  onAnswer: (r: QuizResult, given: string) => void;
  onNext: () => void;
  t: TFunction;
  lang: UiLanguage;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [typed, setTyped] = useState('');
  const [picked, setPicked] = useState<number[]>([]);

  // Listening questions play on arrival.
  useEffect(() => {
    if (q.type === 'listen') speakGerman(spokenForm(word));
  }, [q, word]);

  const checkTyped = useCallback(() => {
    if (typed.trim()) onAnswer(gradeSpelling(word, typed), typed);
  }, [typed, word, onAnswer]);

  const checkOrder = useCallback(() => {
    if (q.type !== 'order') return;
    const built = picked.map((i) => q.tokens[i]!);
    onAnswer(gradeOrder(q.solution, built), built.join(' '));
  }, [q, picked, onAnswer]);

  // Desktop shortcuts: 1–4 pick a choice, Enter continues. Typing in the input is left alone.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (answer) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onNext();
        }
        return;
      }
      const n = Number(e.key) - 1;
      if (!Number.isInteger(n) || n < 0) return;
      if ((q.type === 'meaning' || q.type === 'listen') && n < q.choiceIds.length) {
        onAnswer(gradeChoice(q.wordId, q.choiceIds[n]!), q.choiceIds[n]!);
      } else if (q.type === 'article' && n < ARTICLES.length) {
        onAnswer(ARTICLES[n] === word.article ? 'correct' : 'wrong', ARTICLES[n]!);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, word, answer, onAnswer, onNext]);

  const choiceState = (id: string): ChoiceState =>
    !answer ? 'idle' : id === q.wordId ? 'right' : id === answer.given ? 'wrong' : 'dim';

  let body: ReactNode;
  switch (q.type) {
    case 'meaning':
      body = (
        <>
          <View style={styles.centerCol}>
            <WordHeadline word={word} t={t} showPlural={false} />
            <SpeakButton text={spokenForm(word)} label={t('review.listen')} />
          </View>
          <View style={styles.choices}>
            {q.choiceIds.map((id, i) => (
              <Choice
                key={id}
                n={i + 1}
                state={choiceState(id)}
                onPress={() => onAnswer(gradeChoice(q.wordId, id), id)}
                lines={meaningLines(words.get(id)!, lang)}
              />
            ))}
          </View>
        </>
      );
      break;
    case 'listen':
      body = (
        <>
          <View style={styles.centerCol}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('quiz.replay')}
              onPress={() => speakGerman(spokenForm(word))}
              style={({ pressed }) => [
                styles.bigSpeak,
                { backgroundColor: c.surfaceAlt, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.bigSpeakIcon}>🔊</Text>
            </Pressable>
            <T variant="small">{t('quiz.replay')}</T>
          </View>
          <View style={styles.choices}>
            {q.choiceIds.map((id, i) => (
              <Choice
                key={id}
                n={i + 1}
                state={choiceState(id)}
                onPress={() => onAnswer(gradeChoice(q.wordId, id), id)}
                lines={[spokenForm(words.get(id)!)]}
                german
              />
            ))}
          </View>
        </>
      );
      break;
    case 'article':
      body = (
        <>
          <View style={styles.centerCol}>
            {/* Plain colour: the gender colour would give the answer away. */}
            <Text selectable style={[styles.lemma, { color: c.text }]}>
              {word.lemma}
            </Text>
            <T variant="muted" style={styles.center}>
              {meaningLines(word, lang).join(' · ')}
            </T>
          </View>
          <View style={styles.articles}>
            {ARTICLES.map((a) => (
              <ArticleChoice
                key={a}
                article={a}
                state={
                  !answer
                    ? 'idle'
                    : a === word.article
                      ? 'right'
                      : a === answer.given
                        ? 'wrong'
                        : 'dim'
                }
                onPress={() => onAnswer(a === word.article ? 'correct' : 'wrong', a)}
              />
            ))}
          </View>
        </>
      );
      break;
    case 'spelling':
      body = (
        <>
          <Card style={styles.gap}>
            {meaningLines(word, lang).map((l) => (
              <T key={l} variant="title">
                {l}
              </T>
            ))}
            {q.cloze && (
              <>
                <T variant="body" style={styles.italic}>
                  {q.cloze}
                </T>
                {translationLines(word, lang).map((l) => (
                  <T key={l} variant="small">
                    {l}
                  </T>
                ))}
              </>
            )}
            <T variant="small">
              {t('quiz.hint', { first: word.lemma[0]!, n: [...word.lemma].length })}
            </T>
          </Card>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            editable={!answer}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="done"
            onSubmitEditing={() => (answer ? onNext() : checkTyped())}
            placeholder={t('quiz.inputPlaceholder')}
            placeholderTextColor={c.textMuted}
            accessibilityLabel={t('quiz.prompt.spelling')}
            style={[
              styles.input,
              {
                color: c.text,
                backgroundColor: c.surface,
                borderColor: !answer ? c.border : isPass(answer.result) ? c.success : c.danger,
              },
            ]}
          />
          {!answer && (
            <View style={styles.wrap}>
              {UMLAUTS.map((ch) => (
                <Pressable
                  key={ch}
                  accessibilityRole="button"
                  accessibilityLabel={ch}
                  onPress={() => setTyped((s) => s + ch)}
                  style={[styles.key, { backgroundColor: c.surfaceAlt }]}
                >
                  <Text style={{ color: c.text, fontSize: font.lg }}>{ch}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      );
      break;
    case 'order': {
      const remaining = q.tokens.map((tok, i) => ({ tok, i })).filter((x) => !picked.includes(x.i));
      body = (
        <>
          <Card style={styles.gap}>
            {translationLines(word, lang).map((l) => (
              <T key={l} variant="heading">
                {l}
              </T>
            ))}
          </Card>
          <View
            style={[
              styles.answerArea,
              {
                borderColor: !answer ? c.border : isPass(answer.result) ? c.success : c.danger,
              },
            ]}
          >
            {picked.map((i, pos) => (
              <Token
                key={i}
                label={q.tokens[i]! + (pos === q.tokens.length - 1 ? q.punctuation : '')}
                onPress={answer ? undefined : () => setPicked((p) => p.filter((x) => x !== i))}
                filled
              />
            ))}
          </View>
          <View style={styles.wrap}>
            {remaining.map(({ tok, i }) => (
              <Token
                key={i}
                label={tok}
                onPress={answer ? undefined : () => setPicked((p) => [...p, i])}
              />
            ))}
          </View>
        </>
      );
      break;
    }
  }

  const answerText = q.type === 'order' ? orderSentence(q) : spokenForm(word);

  return (
    <Screen edges={['left', 'right']} padded={false}>
      <View style={styles.topBar}>
        <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: c.primary,
                width: `${((index + (answer ? 1 : 0)) / total) * 100}%`,
              },
            ]}
          />
        </View>
        <T variant="small">
          {t('quiz.progress', { i: index + 1, n: total })} · {t(`quiz.type.${q.type}`)}
        </T>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <T variant="heading" style={styles.center}>
          {t(`quiz.prompt.${q.type}`)}
        </T>
        {body}
        {answer && (
          <Card style={styles.gap}>
            <View style={styles.answerRow}>
              <View style={styles.flex}>
                <WordHeadline word={word} t={t} showPlural={false} />
              </View>
              <SpeakButton
                text={q.type === 'order' ? answerText : spokenForm(word)}
                label={t('review.listen')}
              />
            </View>
            <T variant="muted" style={styles.center}>
              {meaningLines(word, lang).join(' · ')}
            </T>
            {q.type === 'order' && (
              <T variant="body" style={[styles.center, styles.italic]}>
                {answerText}
              </T>
            )}
          </Card>
        )}
      </ScrollView>

      <BottomBar inset={insets.bottom}>
        {answer ? (
          <>
            <T
              variant="heading"
              style={{
                color: answer.result === 'wrong' ? c.danger : c.success,
                textAlign: 'center',
              }}
            >
              {t(`quiz.${answer.result}`, { xp: XP_QUIZ[answer.result] })}
            </T>
            {answer.result !== 'correct' && (
              <T variant="body" style={styles.center}>
                {t('quiz.answerIs', { answer: answerText })}
              </T>
            )}
            <Button
              label={index + 1 >= total ? t('quiz.finish') : t('quiz.next')}
              onPress={onNext}
              style={styles.big}
            />
          </>
        ) : q.type === 'spelling' ? (
          <View style={styles.actions}>
            <Button
              kind="secondary"
              label={t('quiz.dontKnow')}
              onPress={() => onAnswer('wrong', '')}
              style={styles.flex}
            />
            <Button
              label={t('quiz.check')}
              onPress={checkTyped}
              disabled={!typed.trim()}
              style={styles.flex}
            />
          </View>
        ) : q.type === 'order' ? (
          <View style={styles.actions}>
            <Button
              kind="secondary"
              label={t('quiz.clear')}
              onPress={() => setPicked([])}
              disabled={picked.length === 0}
              style={styles.flex}
            />
            <Button
              label={t('quiz.check')}
              onPress={checkOrder}
              disabled={picked.length < q.tokens.length}
              style={styles.flex}
            />
          </View>
        ) : null}
      </BottomBar>
    </Screen>
  );
}

function BottomBar({ inset, children }: { inset: number; children: ReactNode }) {
  const { c } = useTheme();
  if (!children) return null;
  return (
    <View
      style={[
        styles.bottom,
        {
          paddingBottom: Math.max(inset, spacing.md),
          borderTopColor: c.border,
          backgroundColor: c.surface,
        },
      ]}
    >
      {children}
    </View>
  );
}

type ChoiceState = 'idle' | 'right' | 'wrong' | 'dim';

/** Answer option; state is also announced, so colour is never the only signal. */
function Choice({
  n,
  lines,
  state,
  onPress,
  german = false,
}: {
  n: number;
  lines: string[];
  state: ChoiceState;
  onPress: () => void;
  german?: boolean;
}) {
  const { c } = useTheme();
  const border = state === 'right' ? c.success : state === 'wrong' ? c.danger : c.border;
  const mark = state === 'right' ? '✓' : state === 'wrong' ? '✗' : String(n);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: state !== 'idle', selected: state === 'wrong' }}
      accessibilityLabel={`${lines.join(', ')}${state === 'right' ? ' ✓' : state === 'wrong' ? ' ✗' : ''}`}
      disabled={state !== 'idle'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        {
          borderColor: border,
          backgroundColor: c.surface,
          opacity: state === 'dim' ? 0.5 : pressed ? 0.75 : 1,
          borderWidth: state === 'right' || state === 'wrong' ? 2 : 1,
        },
      ]}
    >
      <Text style={[styles.choiceMark, { color: state === 'idle' ? c.textMuted : border }]}>
        {mark}
      </Text>
      <View style={styles.flex}>
        {lines.map((l, i) => (
          <Text
            key={i}
            style={{
              color: i === 0 ? c.text : c.textMuted,
              fontSize: i === 0 ? font.lg : font.sm,
              fontWeight: i === 0 && german ? '600' : '400',
            }}
          >
            {l}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

function ArticleChoice({
  article,
  state,
  onPress,
}: {
  article: Article;
  state: ChoiceState;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const mark = state === 'right' ? ' ✓' : state === 'wrong' ? ' ✗' : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={article + mark}
      disabled={state !== 'idle'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.article,
        {
          backgroundColor: c.genderBg[article],
          borderColor: state === 'wrong' ? c.danger : c.gender[article],
          borderWidth: state === 'right' || state === 'wrong' ? 3 : 1.5,
          opacity: state === 'dim' ? 0.45 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[styles.articleText, { color: c.gender[article] }]}>
        {article}
        {mark}
      </Text>
    </Pressable>
  );
}

function Token({
  label,
  onPress,
  filled = false,
}: {
  label: string;
  onPress?: () => void;
  filled?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={filled ? 'quiz-placed' : 'quiz-token'}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.token,
        {
          backgroundColor: filled ? c.surfaceAlt : c.surface,
          borderColor: c.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={{ color: c.text, fontSize: font.lg }}>{label}</Text>
    </Pressable>
  );
}

function Summary({
  phase,
  words,
  onAgain,
}: {
  phase: Extract<Phase, { kind: 'summary' }>;
  words: Map<string, Word>;
  onAgain: () => void;
}) {
  const { t, settings } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const passed = phase.answers.filter((a) => isPass(a.result)).length;
  const xp = phase.answers.reduce((s, a) => s + XP_QUIZ[a.result], 0);
  const missed = phase.questions
    .filter((_, i) => phase.answers[i]?.result === 'wrong')
    .map((q) => words.get(q.wordId))
    .filter((w): w is Word => !!w);
  const unique = [...new Map(missed.map((w) => [w.id, w])).values()];

  return (
    <Screen scroll contentStyle={styles.summary}>
      <Card style={[styles.centerCol, styles.gap]}>
        <T variant="hero" style={{ color: c.primary }}>
          {t('quiz.score', { ok: passed, n: phase.questions.length })}
        </T>
        <T variant="title" style={{ color: c.success }}>
          {t('quiz.xpEarned', { xp })}
        </T>
      </Card>
      {unique.length === 0 ? (
        <T variant="body" style={styles.center}>
          {t('quiz.perfect')}
        </T>
      ) : (
        <Section title={t('quiz.toReview')}>
          {unique.map((w) => (
            <Pressable
              key={w.id}
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/word/[id]', params: { id: w.id } })}
              style={styles.missRow}
            >
              {w.article && <ArticleBadge article={w.article} size="sm" />}
              <View style={styles.flex}>
                <T variant="heading">{w.lemma}</T>
                <T variant="small">{meaningLines(w, settings.uiLang).join(' · ')}</T>
              </View>
              <T variant="muted">›</T>
            </Pressable>
          ))}
        </Section>
      )}
      <Button label={t('quiz.again')} onPress={onAgain} style={styles.big} />
      <Button kind="secondary" label={t('quiz.home')} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  italic: { fontStyle: 'italic' },
  gap: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  hint: { marginBottom: spacing.lg, marginHorizontal: spacing.xs },
  big: { minHeight: 56 },
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6 },
  body: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  centerCol: { alignItems: 'center', gap: spacing.sm },
  lemma: { fontSize: 40, fontWeight: '700', textAlign: 'center' },
  bigSpeak: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigSpeakIcon: { fontSize: 40 },
  choices: { gap: spacing.sm },
  choice: {
    minHeight: 56,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  choiceMark: { width: 18, textAlign: 'center', fontWeight: '700', fontSize: font.md },
  articles: { flexDirection: 'row', gap: spacing.sm },
  article: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleText: { fontSize: font.xl, fontWeight: '700' },
  input: {
    minHeight: TOUCH + 8,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: font.xl,
  },
  key: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  answerArea: {
    minHeight: 72,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
  token: {
    minHeight: TOUCH - 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bottom: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  summary: { gap: spacing.lg },
  missRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: TOUCH },
});
