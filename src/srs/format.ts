import type { SrsState } from './types';

export type IntervalUnit = 'minute' | 'hour' | 'day' | 'month' | 'year';
export interface IntervalLabel {
  value: number;
  unit: IntervalUnit;
}

const oneDecimal = (n: number) => Math.round(n * 10) / 10;

/** Human-scale wait until `next` is due, measured from `now`. Units are translated by the UI. */
export function describeInterval(next: SrsState, now: number): IntervalLabel {
  if (next.phase === 'review') {
    const d = next.intervalDays;
    if (d < 30) return { value: d, unit: 'day' };
    if (d < 365) return { value: oneDecimal(d / 30), unit: 'month' };
    return { value: oneDecimal(d / 365), unit: 'year' };
  }
  const minutes = Math.max(1, Math.round((next.dueAt - now) / 60_000));
  if (minutes < 60) return { value: minutes, unit: 'minute' };
  return { value: oneDecimal(minutes / 60), unit: 'hour' };
}
