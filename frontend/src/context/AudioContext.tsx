import { createContext, useContext } from 'react';
import type { SoundName } from '../hooks/useSound';
import type { AudioSettings } from '../hooks/useAudioSettings';

export interface AudioContextValue {
  play: (name: SoundName) => void;
  playValueTone?: (value: number, maxVal?: number) => void;
  audioSettings: AudioSettings;
  setAudioSettings: (patch: Partial<AudioSettings>) => void;
}

export const AudioCtx = createContext<AudioContextValue>({
  play: () => {},
  playValueTone: () => {},
  audioSettings: { soundEnabled: true, masterVolume: 0.6, effectsVolume: 0.7 },
  setAudioSettings: () => {},
});

export function useAudio() {
  return useContext(AudioCtx);
}
