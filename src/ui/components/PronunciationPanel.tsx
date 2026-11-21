import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TFunction } from '@/i18n';
import { speakGerman, stopSpeaking } from '@/tts';
import { font, radius, spacing, TOUCH, useTheme } from '../theme';
import { T } from './primitives';

/** Long enough for any example sentence; stops runaway recordings. */
export const MAX_RECORDING_MS = 15_000;

type Phase = 'idle' | 'recording' | 'denied' | 'error';

/**
 * Listen to the model (TTS) → record yourself → play back / compare.
 * No automatic scoring (not feasible offline and for free); the learner judges.
 * Recordings live only in memory/cache for this screen and are never saved or uploaded.
 * Give it `key={text}` so a new text starts with a clean slate.
 */
export function PronunciationPanel({
  text,
  t,
  pitch,
  onRecorded,
}: {
  text: string;
  t: TFunction;
  pitch?: number;
  onRecorded?: () => void;
}) {
  const { c } = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder, 250);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const [phase, setPhase] = useState<Phase>('idle');
  const [clip, setClip] = useState<string | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(async () => {
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = null;
    try {
      await recorder.stop();
      // Back to playback mode, otherwise iOS plays through the quiet earpiece.
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      setClip(recorder.uri);
      setPhase('idle');
      onRecorded?.();
    } catch (e) {
      console.warn('stop recording failed', e);
      setPhase('error');
    }
  }, [recorder, onRecorded]);

  const start = async () => {
    stopSpeaking();
    player.pause();
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setPhase('denied');
      return;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('recording');
      stopTimer.current = setTimeout(() => void stop(), MAX_RECORDING_MS);
    } catch (e) {
      console.warn('start recording failed', e);
      setPhase('error');
    }
  };

  useEffect(
    () => () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      stopSpeaking();
    },
    [],
  );

  const playMine = useCallback(() => {
    if (!clip) return;
    stopSpeaking();
    player.replace({ uri: clip });
    void player.seekTo(0).then(() => player.play());
  }, [clip, player]);

  const playModel = () => {
    player.pause();
    speakGerman(text, { pitch });
  };

  // Model first, then your own recording right after: easiest way to hear differences.
  const compare = () => {
    player.pause();
    speakGerman(text, { pitch, onDone: playMine });
  };

  const recording = phase === 'recording';
  const seconds = Math.floor(recState.durationMillis / 1000);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Action icon="🔊" label={t('speak.model')} onPress={playModel} />
        <Action
          icon={recording ? '⏹' : '🎤'}
          label={recording ? t('speak.stop', { s: seconds }) : t('speak.record')}
          onPress={() => void (recording ? stop() : start())}
          tone={recording ? c.danger : c.primary}
          strong
        />
        <Action
          icon="▶️"
          label={playerStatus.playing ? t('speak.playing') : t('speak.mine')}
          onPress={playMine}
          disabled={!clip || recording}
        />
        <Action
          icon="🔁"
          label={t('speak.compare')}
          onPress={compare}
          disabled={!clip || recording}
        />
      </View>
      {phase === 'denied' && (
        <T variant="small" style={{ color: c.danger }}>
          {t('speak.denied')}
        </T>
      )}
      {phase === 'error' && (
        <T variant="small" style={{ color: c.danger }}>
          {t('speak.error')}
        </T>
      )}
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
  disabled,
  tone,
  strong,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: string;
  strong?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: strong ? (tone ?? c.primary) : c.surfaceAlt,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text numberOfLines={1} style={[styles.label, { color: strong ? c.onPrimary : c.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    minHeight: TOUCH + 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  icon: { fontSize: font.xl },
  label: { fontSize: font.xs, fontWeight: '600', marginTop: 2 },
});
