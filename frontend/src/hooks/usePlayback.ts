import { useEffect, useMemo, useState } from 'react';
import type { RaceResponse } from '../models/types';

export function usePlayback(response: RaceResponse | null, speed: number) {
  const [playing, setPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const maxFrames = useMemo(
    () => Math.max(0, ...(response?.lanes.map((lane) => lane.frames.length) ?? [0])),
    [response]
  );

  useEffect(() => {
    setFrameIndex(0);
  }, [response]);

  useEffect(() => {
    if (!playing || maxFrames <= 1) return undefined;
    const delay = Math.max(18, 240 - speed * 21);
    const id = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= maxFrames - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, delay);
    return () => window.clearInterval(id);
  }, [playing, maxFrames, speed]);

  return {
    playing,
    setPlaying,
    frameIndex,
    setFrameIndex,
    maxFrames,
    reset: () => {
      setPlaying(false);
      setFrameIndex(0);
    }
  };
}
