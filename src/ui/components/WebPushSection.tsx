import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { requestPermission } from '@/notifications/adapter';
import {
  currentSubscriptionCode,
  showTestNotification,
  subscribePush,
  unsubscribePush,
  webPushAvailability,
} from '@/notifications/webPush';
import { useApp } from '@/state/AppContext';
import { font, radius, spacing, useTheme } from '../theme';
import { Button, Section, T } from './primitives';

/** Web build: push via GitHub Actions instead of scheduled local notifications. */
export function WebPushSection() {
  const { settings, updateSettings, t, notifStatus } = useApp();
  const { c } = useTheme();
  const availability = webPushAvailability();
  const n = settings.notifications;
  const [code, setCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (availability === 'ready' && n.enabled) void currentSubscriptionCode().then(setCode);
  }, [availability, n.enabled]);

  const turnOn = async () => {
    // Permission first: iOS only shows the prompt directly inside the tap.
    const p = await requestPermission();
    if (p !== 'granted') {
      setMessage({ text: t('push.denied'), error: true });
      return;
    }
    setCode(await subscribePush());
    setMessage(null);
    await updateSettings({ notifications: { ...n, enabled: true } });
  };

  const turnOff = async () => {
    await unsubscribePush();
    setCode(null);
    await updateSettings({ notifications: { ...n, enabled: false } });
  };

  const toggle = async (on: boolean) => {
    setBusy(true);
    try {
      await (on ? turnOn() : turnOff());
    } catch (e) {
      setMessage({ text: t('push.error', { msg: String(e) }), error: true });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setMessage({ text: t('push.copied'), error: false });
    } catch {
      setMessage({ text: t('push.copyFailed'), error: true });
    }
  };

  const delayWarning = (
    <View style={[styles.warning, { borderColor: c.rating.hard }]}>
      <T variant="body">{t('push.delayWarning')}</T>
    </View>
  );

  if (availability !== 'ready') {
    const key =
      availability === 'needsHomeScreen'
        ? 'push.needsHomeScreen'
        : availability === 'noKey'
          ? 'push.noKey'
          : 'push.unsupported';
    return (
      <Section title={t('notif.section')}>
        <T variant="body">{t(key)}</T>
        {delayWarning}
      </Section>
    );
  }

  return (
    <Section title={t('notif.section')}>
      <View style={styles.row}>
        <T variant="body" style={styles.flex}>
          {t('notif.enabled')}
        </T>
        <Switch
          value={n.enabled}
          disabled={busy}
          onValueChange={(v) => void toggle(v)}
          accessibilityLabel={t('notif.enabled')}
        />
      </View>
      {delayWarning}
      {message && (
        <T variant="body" style={{ color: message.error ? c.danger : c.success }}>
          {message.text}
        </T>
      )}
      {n.enabled && code && (
        <>
          <T variant="heading">{t('push.codeTitle')}</T>
          <T variant="small">{t('push.codeHint')}</T>
          <Text
            selectable
            numberOfLines={4}
            style={[styles.code, { color: c.text, backgroundColor: c.surfaceAlt }]}
          >
            {code}
          </Text>
          <Button label={t('push.copy')} onPress={() => void copy()} />
          <Button
            kind="secondary"
            label={t('push.test')}
            onPress={() =>
              void showTestNotification(t('push.testTitle'), t('push.testBody')).catch(
                (e: unknown) =>
                  setMessage({ text: t('push.error', { msg: String(e) }), error: true }),
              )
            }
          />
          {notifStatus?.status === 'scheduled' && (
            <T variant="small">{t('push.queue', { n: notifStatus.count })}</T>
          )}
          <T variant="small">{t('push.badgeHint')}</T>
        </>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  warning: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md },
  code: {
    fontFamily: 'monospace',
    fontSize: font.xs,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
});
