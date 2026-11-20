import * as Speech from 'expo-speech';

export const GERMAN = 'de-DE';

/**
 * Speaks German text, interrupting anything already playing.
 * iOS: silent when the ring/silent switch is on silent (expo-speech limitation).
 */
export function speakGerman(text: string, rate = 0.9): void {
  void Speech.stop().then(() => Speech.speak(text, { language: GERMAN, rate }));
}

export function stopSpeaking(): void {
  void Speech.stop();
}
