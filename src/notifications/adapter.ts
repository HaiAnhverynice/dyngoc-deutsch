import * as Notifications from 'expo-notifications';
import type { PlannedNotification } from './types';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export const notificationsSupported = true;

/** Show banners even while the app is in the foreground. */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// `status` is 'granted' for authorized and provisional iOS permissions alike.
const toState = (p: Notifications.NotificationPermissionsStatus): PermissionState =>
  p.status === 'granted' ? 'granted' : p.status === 'undetermined' ? 'undetermined' : 'denied';

export async function getPermission(): Promise<PermissionState> {
  return toState(await Notifications.getPermissionsAsync());
}

/** Asks only if not decided yet; call when the user turns notifications on. */
export async function requestPermission(): Promise<PermissionState> {
  const current = await getPermission();
  if (current !== 'undetermined') return current;
  return toState(
    await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    }),
  );
}

/** Replaces the whole pending batch. */
export async function replaceScheduled(plan: PlannedNotification[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const n of plan) {
    await Notifications.scheduleNotificationAsync({
      content: { title: n.title, body: n.body, data: { wordId: n.wordId } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.at },
    });
  }
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

const wordIdOf = (r: Notifications.NotificationResponse | null | undefined): string | null => {
  const id = r?.notification.request.content.data?.wordId;
  return typeof id === 'string' ? id : null;
};

/** Calls `onWord` for taps while running and for the tap that cold-started the app. */
export function subscribeToTaps(onWord: (wordId: string) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const id = wordIdOf(r);
    if (id) onWord(id);
  });
  void Notifications.getLastNotificationResponseAsync().then((r) => {
    const id = wordIdOf(r);
    if (id) {
      onWord(id);
      void Notifications.clearLastNotificationResponseAsync();
    }
  });
  return () => sub.remove();
}
