/* DYNgoc Deutsch service worker (web build only).
 *
 * 1. Offline: network-first cache for same-origin GET requests, so the app still opens
 *    from the home screen without internet once it has been loaded online.
 * 2. Push: GitHub Actions sends a content-free "tick" on a schedule. The word is chosen
 *    here, from a queue the app writes to IndexedDB after every change, so learning
 *    progress never leaves the device.
 */
const CACHE = 'dyngoc-v1';
const DB_NAME = 'dyngoc-push';
const STORE = 'kv';
const SCOPE = self.registration.scope; // e.g. https://user.github.io/dyngoc-deutsch/

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(SCOPE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          void caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        // Offline deep link (e.g. /word/x): serve the app shell, the router does the rest.
        if (req.mode === 'navigate') {
          const shell = await caches.match(SCOPE);
          if (shell) return shell;
        }
        return Response.error();
      }),
  );
});

function idb(mode, fn) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, mode);
      const result = fn(tx.objectStore(STORE));
      tx.oncomplete = () => {
        db.close();
        resolve(result && 'result' in result ? result.result : undefined);
      };
      tx.onerror = () => reject(tx.error);
    };
  });
}

const FALLBACK = {
  vi: { title: 'DYNgoc Deutsch', body: 'Đến giờ ôn từ vựng tiếng Đức rồi!' },
  en: { title: 'DYNgoc Deutsch', body: 'Time for some German vocabulary!' },
};

/** Next queued word (round-robin), or a generic reminder when the queue is empty. */
async function nextMessage() {
  const queue = await idb('readonly', (s) => s.get('queue')).catch(() => undefined);
  const items = (queue && queue.items) || [];
  if (items.length === 0) {
    const lang = queue && queue.lang === 'en' ? 'en' : 'vi';
    return { ...FALLBACK[lang], wordId: null };
  }
  const cursor = (((queue.cursor || 0) % items.length) + items.length) % items.length;
  await idb('readwrite', (s) => s.put({ ...queue, cursor: cursor + 1 }, 'queue')).catch(
    () => undefined,
  );
  return items[cursor];
}

self.addEventListener('push', (event) => {
  // iOS revokes the subscription if a push does not show a notification, so always show one.
  event.waitUntil(
    nextMessage().then((m) =>
      self.registration.showNotification(m.title, {
        body: m.body,
        icon: SCOPE + 'icons/icon-192.png',
        badge: SCOPE + 'icons/badge-96.png',
        tag: 'dyngoc-vocab',
        data: { wordId: m.wordId },
      }),
    ),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const wordId = event.notification.data && event.notification.data.wordId;
  const url = wordId ? SCOPE + 'word/' + encodeURIComponent(wordId) : SCOPE;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const open = clients.find((c) => c.url.startsWith(SCOPE));
      if (open) {
        if (wordId) open.postMessage({ type: 'open-word', wordId });
        return open.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
