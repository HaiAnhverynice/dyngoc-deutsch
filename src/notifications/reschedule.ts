import type { Repository } from '@/db/repository';
import type { AppSettings } from '@/state/settings';
import { unseenWordIds } from '@/vocab/filter';
import { cancelAll, getPermission, replaceScheduled, notificationsSupported } from './adapter';
import { planNotifications, type NotificationCandidate } from './planner';

export interface RescheduleResult {
  status: 'scheduled' | 'disabled' | 'denied' | 'unsupported';
  count: number;
  lastAt: number | null;
}

/** Cancels the pending batch and schedules a fresh one (on launch, foreground, settings change). */
export async function rescheduleNotifications(
  repo: Repository,
  settings: AppSettings,
  now: number,
): Promise<RescheduleResult> {
  if (!notificationsSupported) return { status: 'unsupported', count: 0, lastAt: null };
  if (!settings.notifications.enabled) {
    await cancelAll(settings.uiLang);
    return { status: 'disabled', count: 0, lastAt: null };
  }
  if ((await getPermission()) !== 'granted') {
    return { status: 'denied', count: 0, lastAt: null };
  }

  const [words, cards] = await Promise.all([repo.listWords(), repo.listCards()]);
  const byId = new Map(words.map((w) => [w.id, w]));
  const candidates: NotificationCandidate[] = [];
  for (const c of cards) {
    const word = byId.get(c.wordId);
    if (word) candidates.push({ word, phase: c.phase, dueAt: c.dueAt });
  }
  const cardWordIds = new Set(cards.map((c) => c.wordId));
  // Unseen words preview what comes next; limit keeps the candidate list small.
  for (const id of unseenWordIds(words, settings.levels, cardWordIds).slice(0, 60)) {
    candidates.push({ word: byId.get(id)!, phase: null, dueAt: null });
  }

  const plan = planNotifications({
    settings: settings.notifications,
    lang: settings.uiLang,
    candidates,
    now,
  });
  await replaceScheduled(plan, settings.uiLang);
  return { status: 'scheduled', count: plan.length, lastAt: plan[plan.length - 1]?.at ?? null };
}
