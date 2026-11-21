import type { PlannedNotification } from './types';
import { registerServiceWorker, webPushAvailability, writePushQueue } from './webPush.web';

/**
 * Web: no scheduled local notifications exist in browsers, so "scheduling" means
 * handing the planned words to the service worker, which shows one per GitHub Actions
 * push. Times in the plan are ignored; the cron schedule decides when.
 */
export type PermissionState = 'granted' | 'denied' | 'undetermined';

export const notificationsSupported = webPushAvailability() === 'ready';

export function configureNotificationHandler() {
  void registerServiceWorker();
}

const permission = (): PermissionState => {
  if (typeof Notification === 'undefined') return 'denied';
  const p = Notification.permission;
  return p === 'granted' ? 'granted' : p === 'denied' ? 'denied' : 'undetermined';
};

export async function getPermission(): Promise<PermissionState> {
  return permission();
}

/** Must run inside a tap handler (iOS requires a user gesture). */
export async function requestPermission(): Promise<PermissionState> {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission !== 'default') return permission();
  await Notification.requestPermission();
  return permission();
}

export async function replaceScheduled(plan: PlannedNotification[], lang = 'vi'): Promise<void> {
  await writePushQueue(
    plan.map(({ wordId, title, body }) => ({ wordId, title, body })),
    lang,
  );
}

export async function cancelAll(lang = 'vi'): Promise<void> {
  await writePushQueue([], lang);
}

/** Taps while the app is open arrive as a message from the service worker. */
export function subscribeToTaps(onWord: (wordId: string) => void): () => void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return () => {};
  const onMessage = (e: MessageEvent) => {
    const d = e.data as { type?: string; wordId?: unknown } | null;
    if (d?.type === 'open-word' && typeof d.wordId === 'string') onWord(d.wordId);
  };
  navigator.serviceWorker.addEventListener('message', onMessage);
  return () => navigator.serviceWorker.removeEventListener('message', onMessage);
}
