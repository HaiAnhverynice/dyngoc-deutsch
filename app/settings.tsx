import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Switch, View } from 'react-native';
import { BACKUP_FORMAT_VERSION, backupFileName, createBackup, parseBackup } from '@/backup/format';
import { readPickedText, shareJsonFile } from '@/backup/files';
import { SCHEMA_VERSION } from '@/db/migrations';
import { localeFor, type TFunction, type UiLanguage } from '@/i18n';
import { getPermission, notificationsSupported, requestPermission } from '@/notifications/adapter';
import type { NotificationSettings } from '@/notifications/types';
import { useApp } from '@/state/AppContext';
import { NEW_PER_DAY_MAX, type ThemePreference } from '@/state/settings';
import { confirmAsync, showMessage } from '@/ui/dialog';
import {
  Button,
  Chip,
  Field,
  Screen,
  Section,
  Segmented,
  Stepper,
  T,
  TimeStepper,
} from '@/ui/components/primitives';
import { WebPushSection } from '@/ui/components/WebPushSection';
import { spacing, useTheme } from '@/ui/theme';
import { importCsv, importJson, type ImportReport } from '@/vocab/import';
import { LEVELS } from '@/vocab/types';

const MAX_DAILY_TIMES = 12;
const MAX_REPORT_LINES = 8;

export default function SettingsScreen() {
  const { settings, updateSettings, t } = useApp();
  const { c } = useTheme();

  return (
    <Screen scroll>
      <Section title={t('settings.language')}>
        <Segmented<UiLanguage>
          value={settings.uiLang}
          onChange={(uiLang) => void updateSettings({ uiLang })}
          options={[
            { value: 'vi', label: t('settings.lang.vi') },
            { value: 'en', label: t('settings.lang.en') },
            { value: 'both', label: t('settings.lang.both') },
          ]}
        />
      </Section>

      <Section title={t('settings.theme')}>
        <Segmented<ThemePreference>
          value={settings.theme}
          onChange={(theme) => void updateSettings({ theme })}
          options={[
            { value: 'system', label: t('settings.theme.system') },
            { value: 'light', label: t('settings.theme.light') },
            { value: 'dark', label: t('settings.theme.dark') },
          ]}
        />
      </Section>

      <Section title={t('settings.levels')}>
        <View style={styles.chips}>
          {LEVELS.map((l) => {
            const on = settings.levels.includes(l);
            return (
              <Chip
                key={l}
                label={l}
                selected={on}
                onPress={() => {
                  const levels = on
                    ? settings.levels.filter((x) => x !== l)
                    : [...settings.levels, l];
                  if (levels.length > 0) {
                    void updateSettings({ levels: LEVELS.filter((x) => levels.includes(x)) });
                  }
                }}
              />
            );
          })}
        </View>
        <Field label={t('settings.newPerDay')}>
          <Stepper
            value={settings.newPerDay}
            label={String(settings.newPerDay)}
            min={0}
            max={NEW_PER_DAY_MAX}
            step={5}
            onChange={(newPerDay) => void updateSettings({ newPerDay })}
          />
        </Field>
      </Section>

      {Platform.OS === 'web' ? <WebPushSection /> : <NotificationSection />}
      <DataSection />

      <T variant="small" style={[styles.footer, { color: c.textMuted }]}>
        DB schema v{SCHEMA_VERSION} · backup v{BACKUP_FORMAT_VERSION}
      </T>
    </Screen>
  );
}

function NotificationSection() {
  const { settings, updateSettings, t, notifStatus } = useApp();
  const { c } = useTheme();
  const n = settings.notifications;
  const [denied, setDenied] = useState(false);
  const set = (patch: Partial<NotificationSettings>) =>
    void updateSettings({ notifications: { ...n, ...patch } });

  useEffect(() => {
    if (notificationsSupported && n.enabled) {
      void getPermission().then((p) => setDenied(p === 'denied'));
    }
  }, [n.enabled]);

  const toggle = async (on: boolean) => {
    if (!on) return set({ enabled: false });
    const p = await requestPermission();
    setDenied(p !== 'granted');
    if (p === 'granted') set({ enabled: true });
  };

  const showDenied = denied || notifStatus?.status === 'denied';

  return (
    <Section title={t('notif.section')}>
      <View style={styles.switchRow}>
        <T variant="body" style={styles.flex}>
          {t('notif.enabled')}
        </T>
        <Switch
          value={n.enabled}
          onValueChange={(v) => void toggle(v)}
          accessibilityLabel={t('notif.enabled')}
        />
      </View>

      {showDenied && (
        <View style={styles.gapSm}>
          <T variant="body" style={{ color: c.danger }}>
            {t('notif.denied')}
          </T>
          <Button
            kind="secondary"
            label={t('notif.openSettings')}
            onPress={() => void Linking.openSettings()}
          />
        </View>
      )}

      {n.enabled && (
        <>
          <Field label={t('notif.mode')}>
            <Segmented
              value={n.mode}
              onChange={(mode) => set({ mode })}
              options={[
                { value: 'hourly', label: t('notif.mode.hourly') },
                { value: 'daily', label: t('notif.mode.daily') },
              ]}
            />
          </Field>

          {n.mode === 'hourly' ? (
            <>
              <Stepper
                value={n.everyHours}
                label={t('notif.everyHours', { n: n.everyHours })}
                min={1}
                max={12}
                onChange={(everyHours) => set({ everyHours })}
              />
              <Field label={t('notif.window')}>
                <LabeledTime
                  label={t('notif.from')}
                  value={n.windowStart}
                  onChange={(windowStart) => set({ windowStart })}
                />
                <LabeledTime
                  label={t('notif.to')}
                  value={n.windowEnd}
                  onChange={(windowEnd) => set({ windowEnd })}
                />
              </Field>
            </>
          ) : (
            <Field label={t('notif.dailyTimes')}>
              {n.dailyTimes.map((m, i) => (
                <View key={i} style={styles.timeRow}>
                  <TimeStepper
                    value={m}
                    onChange={(v) =>
                      set({ dailyTimes: n.dailyTimes.map((x, j) => (j === i ? v : x)) })
                    }
                  />
                  {n.dailyTimes.length > 1 && (
                    <Button
                      kind="secondary"
                      label={t('notif.remove')}
                      onPress={() => set({ dailyTimes: n.dailyTimes.filter((_, j) => j !== i) })}
                    />
                  )}
                </View>
              ))}
              {n.dailyTimes.length < MAX_DAILY_TIMES && (
                <Button
                  kind="secondary"
                  label={t('notif.addTime')}
                  onPress={() => {
                    const last = n.dailyTimes[n.dailyTimes.length - 1] ?? 9 * 60;
                    set({ dailyTimes: [...n.dailyTimes, (last + 60) % 1440] });
                  }}
                />
              )}
            </Field>
          )}

          <View style={styles.switchRow}>
            <T variant="body" style={styles.flex}>
              {t('notif.quiet')}
            </T>
            <Switch
              value={n.quietEnabled}
              onValueChange={(quietEnabled) => set({ quietEnabled })}
              accessibilityLabel={t('notif.quiet')}
            />
          </View>
          {n.quietEnabled && (
            <View style={styles.gapSm}>
              <LabeledTime
                label={t('notif.from')}
                value={n.quietStart}
                onChange={(quietStart) => set({ quietStart })}
              />
              <LabeledTime
                label={t('notif.to')}
                value={n.quietEnd}
                onChange={(quietEnd) => set({ quietEnd })}
              />
            </View>
          )}

          <ScheduleStatus />
        </>
      )}
      <T variant="small">{t('notif.batchHint')}</T>
    </Section>
  );
}

function ScheduleStatus() {
  const { t, notifStatus, settings } = useApp();
  if (notifStatus?.status !== 'scheduled') return null;
  if (notifStatus.count === 0 || notifStatus.lastAt === null) {
    return <T variant="small">{t('notif.none')}</T>;
  }
  const date = new Date(notifStatus.lastAt).toLocaleString(localeFor(settings.uiLang), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return <T variant="small">{t('notif.scheduled', { n: notifStatus.count, date })}</T>;
}

function LabeledTime({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.timeRow}>
      <T variant="body" style={styles.timeLabel}>
        {label}
      </T>
      <TimeStepper value={value} onChange={onChange} />
    </View>
  );
}

function formatReport(r: ImportReport, t: TFunction): string {
  const lines = [
    t('data.importResult', {
      added: r.added.length,
      dup: r.duplicates.length,
      err: r.errors.length,
    }),
    ...r.errors.map((e) =>
      t('data.lineError', {
        line: e.line,
        msg: e.issues.map((i) => t(`val.${i.code}`, { field: i.field })).join('; '),
      }),
    ),
    ...r.duplicates.map((d) => t('data.dupLine', { line: d.line, lemma: d.lemma })),
  ];
  const extra = lines.length - 1 - MAX_REPORT_LINES;
  return [
    ...lines.slice(0, MAX_REPORT_LINES + 1),
    ...(extra > 0 ? [t('data.moreLines', { n: extra })] : []),
  ].join('\n');
}

async function pickFile(): Promise<{ name: string; text: string } | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  const asset = res.canceled ? null : res.assets[0];
  if (!asset) return null;
  return { name: asset.name, text: await readPickedText(asset) };
}

function DataSection() {
  const { repo, t, settings, notifyDataChanged, reloadSettings } = useApp();
  const [report, setReport] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      showMessage(t('common.error'), String(e));
    } finally {
      setBusy(false);
    }
  };

  const doImport = () =>
    run(async () => {
      const file = await pickFile();
      if (!file) return;
      const lower = file.name.toLowerCase();
      const existing = await repo.listWords({ includeDeleted: true });
      const now = Date.now();
      const r = lower.endsWith('.csv')
        ? importCsv(file.text, existing, now)
        : lower.endsWith('.json')
          ? importJson(file.text, existing, now)
          : null;
      if (!r) return showMessage(t('common.error'), t('data.unsupportedFile'));
      if (r.added.length > 0) await repo.upsertWords(r.added);
      setReport(formatReport(r, t));
      notifyDataChanged();
    });

  const doExport = () =>
    run(async () => {
      const now = Date.now();
      const backup = createBackup(await repo.exportUserData(), now, SCHEMA_VERSION);
      await shareJsonFile(backupFileName(now), JSON.stringify(backup));
      if (Platform.OS === 'web') showMessage(t('data.export'), t('data.exported'));
    });

  const doRestore = () =>
    run(async () => {
      const file = await pickFile();
      if (!file) return;
      const parsed = parseBackup(file.text);
      if (!parsed.ok) {
        return showMessage(t('common.error'), t('data.invalidBackup', { reason: parsed.reason }));
      }
      const b = parsed.backup;
      const ok = await confirmAsync(
        t('data.restore'),
        t('data.restoreConfirm', {
          cards: b.cards.length,
          logs: b.reviewLogs.length,
          date: new Date(b.exportedAt).toLocaleString(localeFor(settings.uiLang)),
        }),
        t('data.restore.go'),
        t('common.cancel'),
      );
      if (!ok) return;
      await repo.replaceUserData(b);
      await reloadSettings();
      notifyDataChanged();
      showMessage(t('data.restore'), t('data.restoreDone'));
    });

  return (
    <Section title={t('data.section')}>
      <Button
        kind="secondary"
        label={t('data.import')}
        onPress={() => void doImport()}
        disabled={busy}
      />
      {report && (
        <T variant="small" selectable>
          {report}
        </T>
      )}
      <Button
        kind="secondary"
        label={t('data.export')}
        onPress={() => void doExport()}
        disabled={busy}
      />
      <Button
        kind="danger"
        label={t('data.restore')}
        onPress={() => void doRestore()}
        disabled={busy}
      />
      {repo.kind === 'memory' && <T variant="small">{t('data.webStorage')}</T>}
    </Section>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: spacing.md },
  gapSm: { gap: spacing.sm },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  timeLabel: { minWidth: 48 },
  footer: { textAlign: 'center', marginBottom: spacing.xl },
});
