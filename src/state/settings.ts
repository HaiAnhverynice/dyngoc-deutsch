import type { UiLanguage } from '@/i18n';
import { DEFAULT_NOTIFICATION_SETTINGS, type NotificationSettings } from '@/notifications/types';
import { LEVELS, type Level } from '@/vocab/types';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  uiLang: UiLanguage;
  theme: ThemePreference;
  levels: Level[];
  newPerDay: number;
  notifications: NotificationSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  uiLang: 'vi',
  theme: 'system',
  levels: ['A1'],
  newPerDay: 10,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
};

export const NEW_PER_DAY_MAX = 100;

const isMinute = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 1440;

function parseJson(s: string | undefined): unknown {
  if (s === undefined) return undefined;
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

function sanitizeNotifications(v: unknown): NotificationSettings {
  const d = DEFAULT_NOTIFICATION_SETTINGS;
  if (typeof v !== 'object' || v === null) return d;
  const o = v as Partial<Record<keyof NotificationSettings, unknown>>;
  const dailyTimes = Array.isArray(o.dailyTimes) ? o.dailyTimes.filter(isMinute) : d.dailyTimes;
  return {
    enabled: typeof o.enabled === 'boolean' ? o.enabled : d.enabled,
    mode: o.mode === 'daily' || o.mode === 'hourly' ? o.mode : d.mode,
    everyHours:
      typeof o.everyHours === 'number' && o.everyHours >= 1 && o.everyHours <= 12
        ? Math.round(o.everyHours)
        : d.everyHours,
    windowStart: isMinute(o.windowStart) ? o.windowStart : d.windowStart,
    windowEnd: isMinute(o.windowEnd) ? o.windowEnd : d.windowEnd,
    dailyTimes: [...new Set(dailyTimes)].sort((a, b) => a - b),
    quietEnabled: typeof o.quietEnabled === 'boolean' ? o.quietEnabled : d.quietEnabled,
    quietStart: isMinute(o.quietStart) ? o.quietStart : d.quietStart,
    quietEnd: isMinute(o.quietEnd) ? o.quietEnd : d.quietEnd,
  };
}

/** Settings are stored as one JSON value per top-level key; unknown or bad values fall back. */
export function parseSettings(raw: Record<string, string>): AppSettings {
  const d = DEFAULT_SETTINGS;
  const uiLang = parseJson(raw.uiLang);
  const theme = parseJson(raw.theme);
  const levels = parseJson(raw.levels);
  const newPerDay = parseJson(raw.newPerDay);
  const validLevels = Array.isArray(levels)
    ? LEVELS.filter((l) => (levels as unknown[]).includes(l))
    : [];
  return {
    uiLang: uiLang === 'vi' || uiLang === 'en' || uiLang === 'both' ? uiLang : d.uiLang,
    theme: theme === 'system' || theme === 'light' || theme === 'dark' ? theme : d.theme,
    levels: validLevels.length > 0 ? validLevels : d.levels,
    newPerDay:
      typeof newPerDay === 'number' && newPerDay >= 0 && newPerDay <= NEW_PER_DAY_MAX
        ? Math.round(newPerDay)
        : d.newPerDay,
    notifications: sanitizeNotifications(parseJson(raw.notifications)),
  };
}

export function serializeSettings(s: AppSettings): Record<string, string> {
  return {
    uiLang: JSON.stringify(s.uiLang),
    theme: JSON.stringify(s.theme),
    levels: JSON.stringify(s.levels),
    newPerDay: JSON.stringify(s.newPerDay),
    notifications: JSON.stringify(s.notifications),
  };
}
