import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useApp } from '@/state/AppContext';
import { Chip, Screen, T } from '@/ui/components/primitives';
import { ArticleBadge } from '@/ui/components/word';
import { font, radius, spacing, TOUCH, useTheme } from '@/ui/theme';
import { collectTags, filterWords } from '@/vocab/filter';
import { LEVELS, type Level, type Word } from '@/vocab/types';

const toggle = <T,>(list: T[], v: T) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

export default function BrowseScreen() {
  const { repo, t, dataVersion } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [studying, setStudying] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [levels, setLevels] = useState<Level[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([repo.listWords(), repo.listCards()]).then(([w, cards]) => {
        setWords(w);
        setStudying(new Set(cards.map((x) => x.wordId)));
      });
      // dataVersion is a deliberate trigger.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repo, dataVersion]),
  );

  const allTags = useMemo(() => collectTags(words), [words]);
  const shown = useMemo(
    () => filterWords(words, { query, levels, tags }),
    [words, query, levels, tags],
  );

  return (
    <Screen edges={['left', 'right']} padded={false}>
      <View style={styles.filters}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('browse.search')}
          placeholderTextColor={c.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel={t('browse.search')}
          style={[
            styles.search,
            { backgroundColor: c.surface, borderColor: c.border, color: c.text },
          ]}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Chip
            label={t('browse.allLevels')}
            selected={levels.length === 0}
            onPress={() => setLevels([])}
          />
          {LEVELS.map((l) => (
            <Chip
              key={l}
              label={l}
              selected={levels.includes(l)}
              onPress={() => setLevels(toggle(levels, l))}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Chip
            label={t('browse.allTags')}
            selected={tags.length === 0}
            onPress={() => setTags([])}
          />
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={tags.includes(tag)}
              onPress={() => setTags(toggle(tags, tag))}
            />
          ))}
        </ScrollView>
        <T variant="small">{t('browse.count', { n: shown.length })}</T>
      </View>

      <FlatList
        data={shown}
        keyExtractor={(w) => w.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <T variant="muted" style={styles.empty}>
            {t('browse.empty')}
          </T>
        }
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: c.border }]} />}
        renderItem={({ item: w }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/word/[id]', params: { id: w.id } })}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? c.surfaceAlt : 'transparent' },
            ]}
          >
            <View style={styles.rowMain}>
              <View style={styles.rowHead}>
                {w.article && <ArticleBadge article={w.article} size="sm" />}
                <T variant="heading" numberOfLines={1} style={styles.flex}>
                  {w.lemma}
                  {w.plural ? <T variant="small"> · die {w.plural}</T> : null}
                </T>
              </View>
              <T variant="muted" numberOfLines={1}>
                {w.vi} · {w.en}
              </T>
            </View>
            <View style={styles.rowMeta}>
              <T variant="small">{w.level}</T>
              {studying.has(w.id) && <View style={[styles.dot, { backgroundColor: c.success }]} />}
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filters: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  search: {
    minHeight: TOUCH,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: font.md,
  },
  chipRow: { flexGrow: 0 },
  list: { paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  rowMain: { flex: 1, gap: 2 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowMeta: { alignItems: 'flex-end', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
