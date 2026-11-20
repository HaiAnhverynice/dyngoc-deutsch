import { CONTENT_FILES } from '@content/index';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState, useColorScheme } from 'react-native';
import { createRepository } from '@/db/createRepository';
import type { Repository } from '@/db/repository';
import { createT, type TFunction } from '@/i18n';
import { rescheduleNotifications, type RescheduleResult } from '@/notifications/reschedule';
import { scheduler } from '@/srs';
import type { Scheduler } from '@/srs/types';
import { dark, light, ThemeContext, type Theme } from '@/ui/theme';
import { seedContent } from '@/vocab/seed';
import { parseSettings, serializeSettings, type AppSettings } from './settings';
import type { IdFactory } from './study';

interface AppContextValue {
  repo: Repository;
  scheduler: Scheduler;
  makeId: IdFactory;
  settings: AppSettings;
  t: TFunction;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  /** Re-reads settings from storage (after restoring a backup). */
  reloadSettings: () => Promise<void>;
  /** Increments whenever words/cards change outside the current screen. */
  dataVersion: number;
  notifyDataChanged: () => void;
  notifStatus: RescheduleResult | null;
  rescheduleNow: () => Promise<RescheduleResult>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const v = useContext(AppContext);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}

const makeId: IdFactory = () => Crypto.randomUUID();
const RESCHEDULE_DEBOUNCE_MS = 800;
const NOT_SCHEDULED: RescheduleResult = { status: 'disabled', count: 0, lastAt: null };

type Boot =
  | { state: 'loading' }
  | { state: 'error'; error: string }
  | { state: 'ready'; repo: Repository; settings: AppSettings };

export function AppProvider({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: (error: string | null) => ReactNode;
}) {
  const [boot, setBoot] = useState<Boot>({ state: 'loading' });
  const [dataVersion, setDataVersion] = useState(0);
  const [notifStatus, setNotifStatus] = useState<RescheduleResult | null>(null);
  const systemScheme = useColorScheme();

  useEffect(() => {
    let alive = true;
    (async () => {
      const repo = await createRepository();
      await seedContent(repo, CONTENT_FILES, Date.now());
      const settings = parseSettings(await repo.getSettings());
      if (alive) setBoot({ state: 'ready', repo, settings });
    })().catch((e: unknown) => {
      console.error(e);
      if (alive) setBoot({ state: 'error', error: String(e) });
    });
    return () => {
      alive = false;
    };
  }, []);

  const repo = boot.state === 'ready' ? boot.repo : null;
  const settings = boot.state === 'ready' ? boot.settings : null;

  const rescheduleNow = useCallback(async (): Promise<RescheduleResult> => {
    if (!repo || !settings) return NOT_SCHEDULED;
    try {
      const res = await rescheduleNotifications(repo, settings, Date.now());
      setNotifStatus(res);
      return res;
    } catch (e) {
      console.warn('reschedule failed', e);
      setNotifStatus(NOT_SCHEDULED);
      return NOT_SCHEDULED;
    }
  }, [repo, settings]);

  // Fresh batch on launch and after every settings change (debounced: steppers fire rapidly)…
  useEffect(() => {
    if (!repo) return;
    const id = setTimeout(() => void rescheduleNow(), RESCHEDULE_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [repo, rescheduleNow]);

  // …and every time the app returns to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void rescheduleNow();
    });
    return () => sub.remove();
  }, [rescheduleNow]);

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      if (!repo || !settings) return;
      const next = { ...settings, ...patch };
      setBoot({ state: 'ready', repo, settings: next });
      await repo.setSettings(serializeSettings(next), Date.now());
    },
    [repo, settings],
  );

  const reloadSettings = useCallback(async () => {
    if (!repo) return;
    setBoot({ state: 'ready', repo, settings: parseSettings(await repo.getSettings()) });
  }, [repo]);

  const notifyDataChanged = useCallback(() => setDataVersion((v) => v + 1), []);

  const theme: Theme = useMemo(() => {
    const pref = settings?.theme ?? 'system';
    const isDark = pref === 'dark' || (pref === 'system' && systemScheme === 'dark');
    return { dark: isDark, c: isDark ? dark : light };
  }, [settings?.theme, systemScheme]);

  const value = useMemo<AppContextValue | null>(
    () =>
      repo && settings
        ? {
            repo,
            scheduler,
            makeId,
            settings,
            t: createT(settings.uiLang),
            updateSettings,
            reloadSettings,
            dataVersion,
            notifyDataChanged,
            notifStatus,
            rescheduleNow,
          }
        : null,
    [
      repo,
      settings,
      updateSettings,
      reloadSettings,
      dataVersion,
      notifyDataChanged,
      notifStatus,
      rescheduleNow,
    ],
  );

  return (
    <ThemeContext.Provider value={theme}>
      {value ? (
        <AppContext.Provider value={value}>{children}</AppContext.Provider>
      ) : (
        fallback(boot.state === 'error' ? boot.error : null)
      )}
    </ThemeContext.Provider>
  );
}
