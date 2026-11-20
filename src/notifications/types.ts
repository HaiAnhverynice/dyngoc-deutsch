export type NotificationMode = 'hourly' | 'daily';

/** All times are minutes after local midnight (0‥1439). */
export interface NotificationSettings {
  enabled: boolean;
  mode: NotificationMode;
  everyHours: number;
  windowStart: number;
  windowEnd: number;
  dailyTimes: number[];
  quietEnabled: boolean;
  quietStart: number;
  quietEnd: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  mode: 'hourly',
  everyHours: 2,
  windowStart: 8 * 60,
  windowEnd: 21 * 60,
  dailyTimes: [8 * 60, 12 * 60, 19 * 60],
  quietEnabled: true,
  quietStart: 22 * 60,
  quietEnd: 7 * 60,
};

export interface PlannedNotification {
  at: number;
  wordId: string;
  title: string;
  body: string;
}
