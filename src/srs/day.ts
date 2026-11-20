/**
 * Local-calendar day helpers. A "study day" starts at DAY_START_HOUR local time
 * (like Anki), so reviewing at 01:00 still counts toward the previous day.
 * All functions use the JS local timezone, which follows the device setting.
 */
export const DAY_START_HOUR = 4;

const MS_PER_DAY = 86_400_000;

/** Start (ms) of the study day containing `ms`. */
export function startOfStudyDay(ms: number, dayStartHour = DAY_START_HOUR): number {
  const d = new Date(ms);
  if (d.getHours() < dayStartHour) d.setDate(d.getDate() - 1);
  d.setHours(dayStartHour, 0, 0, 0);
  return d.getTime();
}

/** Adds calendar days in local time (DST-safe: keeps wall-clock time). */
export function addLocalDays(ms: number, days: number): number {
  const d = new Date(ms);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Monotonic index of the study day containing `ms`; differences give whole days. */
export function studyDayIndex(ms: number, dayStartHour = DAY_START_HOUR): number {
  const d = new Date(startOfStudyDay(ms, dayStartHour));
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY);
}

/** Local midnight of the calendar day containing `ms`. */
export function startOfCalendarDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Local time `minuteOfDay` minutes after midnight on the calendar day of `dayMs`. */
export function atLocalMinute(dayMs: number, minuteOfDay: number): number {
  const d = new Date(dayMs);
  d.setHours(0, 0, 0, 0);
  d.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);
  return d.getTime();
}

export function localMinuteOfDay(ms: number): number {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes();
}
