import * as Speech from 'expo-speech';

export const GERMAN = 'de-DE';

export interface SpeakOptions {
  rate?: number;
  /** 0.5–2; used to tell dialogue speakers apart. */
  pitch?: number;
  /** Called when this utterance finishes (not when it is interrupted). */
  onDone?: () => void;
}

/**
 * Speaks German text, interrupting anything already playing.
 * iOS: silent when the ring/silent switch is on silent (expo-speech limitation).
 */
export function speakGerman(text: string, opts: SpeakOptions | number = {}): void {
  const o = typeof opts === 'number' ? { rate: opts } : opts;
  void Speech.stop().then(() =>
    Speech.speak(text, {
      language: GERMAN,
      rate: o.rate ?? 0.9,
      pitch: o.pitch ?? 1,
      onDone: o.onDone,
    }),
  );
}

export function stopSpeaking(): void {
  void Speech.stop();
}
