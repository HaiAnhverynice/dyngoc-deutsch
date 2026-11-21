import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useApp } from '@/state/AppContext';
import { useStudySnapshot } from '@/state/useStudySnapshot';
import { Screen, T } from '@/ui/components/primitives';
import { font, radius, spacing, TOUCH, useTheme } from '@/ui/theme';
import { fold, foldGerman } from '@/vocab/text';

export default function VerbsScreen() {
  const { t } = useApp();
  const { c } = useTheme();
  const router = useRouter();
  const { snap } = useStudySnapshot();
  const [q, setQ] = useState('');

  const verbs = useMemo(() => {
    const all = (snap?.words ?? [])
      .filter((w) => w.verb)
      .sort((a, b) => a.lemma.localeCompare(b.lemma, 'de'));
    const needle = q.trim();
    if (!needle) return all;
    const f = fold(needle);
    const g = foldGerman(needle);
    return all.filter(
      (w) =>
        fold(w.lemma).includes(f) ||
        foldGerman(w.lemma).includes(g) ||
        fold(w.vi).includes(f) ||
        fold(w.en).includes(f),
    );
  }, [snap, q]);

  return (
    <Screen edges={['left', 'right', 'bottom']} padded={false}>
      <View style={styles.searchWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('verbs.search')}
          placeholderTextColor={c.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={[
            styles.search,
            { color: c.text, backgroundColor: c.surface, borderColor: c.border },
          ]}
        />
      </View>
      <FlatList
        data={verbs}
        keyExtractor={(w) => w.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={snap ? <T variant="muted">{t('verbs.empty')}</T> : undefined}
        renderItem={({ item: w }) => (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push({ pathname: '/word/[id]', params: { id: w.id } })}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: c.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <View style={styles.flex}>
              <T variant="heading">{w.lemma}</T>
              <T variant="small">
                {w.verb!.thirdPerson} · {w.verb!.preterite} ·{' '}
                {w.verb!.auxiliary === 'sein' ? 'ist' : 'hat'} {w.verb!.participle}
              </T>
            </View>
            <T variant="muted" numberOfLines={1} style={styles.meaning}>
              {w.vi}
            </T>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchWrap: { padding: spacing.lg, paddingBottom: spacing.sm },
  search: {
    minHeight: TOUCH,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: font.md,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  meaning: { maxWidth: '40%' },
});
