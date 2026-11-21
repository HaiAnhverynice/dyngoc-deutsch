/**
 * Web Push lives only in the web build (see webPush.web.ts). Native uses scheduled
 * local notifications instead, so everything here is inert.
 */
export type WebPushAvailability = 'unsupported' | 'needsHomeScreen' | 'noKey' | 'ready';

export interface QueueItem {
  wordId: string;
  title: string;
  body: string;
}

export const webPushAvailability = (): WebPushAvailability => 'unsupported';
export async function registerServiceWorker(): Promise<void> {}
export async function subscribePush(): Promise<string> {
  throw new Error('Web Push is web-only');
}
export async function currentSubscriptionCode(): Promise<string | null> {
  return null;
}
export async function unsubscribePush(): Promise<void> {}
export async function showTestNotification(_title: string, _body: string): Promise<void> {}
export async function writePushQueue(_items: QueueItem[], _lang: string): Promise<void> {}
export async function setAppBadge(_count: number): Promise<void> {}
