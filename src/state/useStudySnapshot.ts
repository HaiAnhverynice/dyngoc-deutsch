import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useApp } from './AppContext';
import { loadStudySnapshot, type StudySnapshot } from './study';

/** Reloads whenever the screen gains focus or data/settings change. */
export function useStudySnapshot(): { snap: StudySnapshot | null; reload: () => Promise<void> } {
  const { repo, settings, dataVersion } = useApp();
  const [snap, setSnap] = useState<StudySnapshot | null>(null);

  const reload = useCallback(async () => {
    setSnap(await loadStudySnapshot(repo, settings, Date.now()));
    // dataVersion is a deliberate trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, settings, dataVersion]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  return { snap, reload };
}
