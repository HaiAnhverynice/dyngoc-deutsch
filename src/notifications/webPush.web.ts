import type { QueueItem, WebPushAvailability } from './webPush';

export type { QueueItem, WebPushAvailability } from './webPush';

/**
 * Web Push for the GitHub Pages build. GitHub Actions sends content-free pushes on a
 * cron schedule; public/sw.js picks the word from the queue written here (IndexedDB),
 * so no learning data ever leaves the device.
 *
 * The VAPID public key is inlined at build time (repo variable VAPID_PUBLIC_KEY).
 */
const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const BASE_URL = process.env.EXPO_BASE_URL ?? '';
const DB_NAME = 'dyngoc-push';
const STORE = 'kv';

const hasPushApis = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

const isIos = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export function webPushAvailability(): WebPushAvailability {
  // iOS exposes Web Push only to web apps opened from the Home Screen.
  if (isIos() && !isStandalone()) return 'needsHomeScreen';
  if (!hasPushApis()) return 'unsupported';
  if (!VAPID_PUBLIC_KEY) return 'noKey';
  return 'ready';
}

let registration: Promise<ServiceWorkerRegistration | null> | null = null;

/** Registers public/sw.js once (offline cache + push handling). */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }
  registration ??= navigator.serviceWorker
    .register(`${BASE_URL}/sw.js`, { scope: `${BASE_URL}/` })
    .catch((e: unknown) => {
      console.warn('service worker registration failed', e);
      return null;
    });
  return registration;
}

async function readyRegistration(): Promise<ServiceWorkerRegistration> {
  await registerServiceWorker();
  return navigator.serviceWorker.ready;
}

function base64UrlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = (s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** The text the owner pastes into the PUSH_SUBSCRIPTIONS secret. */
const toCode = (sub: PushSubscription) => JSON.stringify(sub.toJSON());

/** Subscribes (or returns the existing subscription). Call after permission is granted. */
export async function subscribePush(): Promise<string> {
  const reg = await readyRegistration();
  const existing = await reg.pushManager.getSubscription();
  if (existing) return toCode(existing);
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY),
  });
  return toCode(sub);
}

export async function currentSubscriptionCode(): Promise<string | null> {
  if (!hasPushApis()) return null;
  const reg = await navigator.serviceWorker.getRegistration(`${BASE_URL}/`);
  const sub = await reg?.pushManager.getSubscription();
  return sub ? toCode(sub) : null;
}

export async function unsubscribePush(): Promise<void> {
  if (!hasPushApis()) return;
  const reg = await navigator.serviceWorker.getRegistration(`${BASE_URL}/`);
  await (await reg?.pushManager.getSubscription())?.unsubscribe();
}

export async function showTestNotification(title: string, body: string): Promise<void> {
  const reg = await readyRegistration();
  await reg.showNotification(title, {
    body,
    icon: `${BASE_URL}/icons/icon-192.png`,
    tag: 'dyngoc-test',
  });
}

function withStore(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, mode);
      fn(tx.objectStore(STORE));
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });
}

/** Replaces the words the service worker will use for upcoming pushes (cursor restarts). */
export async function writePushQueue(items: QueueItem[], lang: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await withStore('readwrite', (s) => {
    s.put({ items, lang, cursor: 0, updatedAt: Date.now() }, 'queue');
  });
}

/** Number on the Home Screen icon; needs notification permission on iOS. */
export async function setAppBadge(count: number): Promise<void> {
  const nav = navigator as Navigator & {
    setAppBadge?: (n?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  if (!nav.setAppBadge || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    if (count > 0) await nav.setAppBadge(count);
    else await nav.clearAppBadge?.();
  } catch {
    // Unsupported in this context; the badge is a nice-to-have.
  }
}
