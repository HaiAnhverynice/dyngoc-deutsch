import type { PlannedNotification } from './types';

// Scheduled local notifications have no web equivalent in expo-notifications.
export type PermissionState = 'granted' | 'denied' | 'undetermined';

export const notificationsSupported = false;
export function configureNotificationHandler() {}
export async function getPermission(): Promise<PermissionState> {
  return 'denied';
}
export async function requestPermission(): Promise<PermissionState> {
  return 'denied';
}
export async function replaceScheduled(_plan: PlannedNotification[]): Promise<void> {}
export async function cancelAll(): Promise<void> {}
export function subscribeToTaps(_onWord: (wordId: string) => void): () => void {
  return () => {};
}
