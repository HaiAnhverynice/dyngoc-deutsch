import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import type { ProgressSummary } from '@/progress';
import { useApp } from './AppContext';
import { loadProgress } from './quiz';

/** Streak/XP/week stats; reloads on focus and after data changes. */
export function useProgress(): ProgressSummary | null {
  const { repo, dataVersion } = useApp();
  const [progress, setProgress] = useState<ProgressSummary | null>(null);

  const reload = useCallback(async () => {
    setProgress(await loadProgress(repo, Date.now()));
    // dataVersion is a deliberate trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, dataVersion]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  return progress;
}
