// Sends one content-free Web Push to every subscription in PUSH_SUBSCRIPTIONS.
// Run by .github/workflows/push.yml; the phone's service worker picks the word itself.
//
// Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (https: or mailto: URL),
//      PUSH_SUBSCRIPTIONS = one subscription JSON object, or a JSON array of them.
import webpush from 'web-push';

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_SUBSCRIPTIONS } = process.env;

if (!PUSH_SUBSCRIPTIONS?.trim()) {
  console.log('PUSH_SUBSCRIPTIONS is empty: nothing to send.');
  process.exit(0);
}
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
  console.error(
    '::error::Set the VAPID_PUBLIC_KEY variable and VAPID_PRIVATE_KEY secret (see README).',
  );
  process.exit(1);
}

let subs;
try {
  const parsed = JSON.parse(PUSH_SUBSCRIPTIONS);
  subs = Array.isArray(parsed) ? parsed : [parsed];
} catch {
  console.error(
    '::error::PUSH_SUBSCRIPTIONS is not valid JSON. Paste the code exactly as copied from the app; for several devices use [code1, code2].',
  );
  process.exit(1);
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

let failed = 0;
for (const [i, sub] of subs.entries()) {
  const label = `#${i + 1} (${sub?.endpoint ? new URL(sub.endpoint).host : 'no endpoint'})`;
  try {
    // TTL: drop the push if the phone stays offline for over an hour; a stale reminder is useless.
    await webpush.sendNotification(sub, '{"t":"tick"}', { TTL: 3600, urgency: 'normal' });
    console.log(`sent ${label}`);
  } catch (e) {
    failed++;
    const status = e?.statusCode;
    if (status === 404 || status === 410) {
      console.error(
        `::error::Subscription ${label} has expired (HTTP ${status}). On that device: Settings → turn notifications off and on, copy the new code and replace it in PUSH_SUBSCRIPTIONS.`,
      );
    } else {
      console.error(
        `::error::Push to ${label} failed: HTTP ${status ?? '?'} ${e?.body ?? e?.message ?? e}`,
      );
    }
  }
}
process.exit(failed > 0 ? 1 : 0);
