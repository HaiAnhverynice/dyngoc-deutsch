import { createSm2Scheduler } from './sm2';
import type { Scheduler } from './types';

export * from './types';
export { describeInterval } from './format';
export type { IntervalLabel, IntervalUnit } from './format';

/** Single swap point: replace with an FSRS implementation of `Scheduler` later. */
export const scheduler: Scheduler = createSm2Scheduler();
