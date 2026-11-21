import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureNotificationHandler, subscribeToTaps } from '@/notifications/adapter';
import { AppProvider, useApp } from '@/state/AppContext';
import { spacing, useTheme } from '@/ui/theme';

configureNotificationHandler();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider fallback={(error) => <BootScreen error={error} />}>
        <Navigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const { t } = useApp();
  const { c, dark } = useTheme();
  const router = useRouter();

  // Tapping a vocab notification opens that word.
  useEffect(
    () => subscribeToTaps((id) => router.push({ pathname: '/word/[id]', params: { id } })),
    [router],
  );

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          headerTitleStyle: { color: c.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.bg },
          headerBackTitle: t('common.back'),
        }}
      >
        <Stack.Screen name="index" options={{ title: t('home.title') }} />
        <Stack.Screen name="review" options={{ title: t('review.title') }} />
        <Stack.Screen name="quiz" options={{ title: t('quiz.title') }} />
        <Stack.Screen name="grammar/index" options={{ title: t('grammar.title') }} />
        <Stack.Screen name="grammar/[id]" options={{ title: '' }} />
        <Stack.Screen name="reading/index" options={{ title: t('reading.title') }} />
        <Stack.Screen name="reading/[id]" options={{ title: '' }} />
        <Stack.Screen name="speak" options={{ title: t('speak.title') }} />
        <Stack.Screen name="verbs" options={{ title: t('verbs.title') }} />
        <Stack.Screen name="browse" options={{ title: t('browse.title') }} />
        <Stack.Screen name="word/[id]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      </Stack>
    </>
  );
}

function BootScreen({ error }: { error: string | null }) {
  const { c } = useTheme();
  return (
    <View style={[styles.boot, { backgroundColor: c.bg }]}>
      {error ? (
        <Text style={{ color: c.danger, textAlign: 'center' }}>{error}</Text>
      ) : (
        <ActivityIndicator color={c.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
