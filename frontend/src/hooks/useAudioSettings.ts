import { useCallback, useEffect, useState } from 'react';

export interface AudioSettings {
  soundEnabled: boolean;
  masterVolume: number;  // 0–1
  effectsVolume: number; // 0–1
}

const STORAGE_KEY = 'algorace:audio';

const DEFAULTS: AudioSettings = {
  soundEnabled: true,
  masterVolume: 0.6,
  effectsVolume: 0.7,
};

function load(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULTS };
}

export function useAudioSettings() {
  const [settings, setSettingsState] = useState<AudioSettings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore write errors (private browsing, quota, etc.)
    }
  }, [settings]);

  const setSettings = useCallback((patch: Partial<AudioSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, setSettings };
}
