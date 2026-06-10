import { useEffect, useMemo, useState } from 'react';
import type { RaceResponse } from '../models/types';

export type FrameEvent = 'compare' | 'swap' | 'hit' | 'miss' | 'step';

export function usePlayback(
  response: RaceResponse | null,
  speed: number,
  onFrame?: (event: FrameEvent, frameIndex: number) => void
) {
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
        const next = current + 1;
        // Fire frame event for audio hooks — pick first lane's frame type if available
        if (onFrame && response?.lanes[0]?.frames[next]) {
          const frame = response.lanes[0].frames[next] as Record<string, unknown>;
          // Detect frame type from common sentinel fields set by the backend
          if (frame.swapped === true) {
            onFrame('swap', next);
          } else if (frame.found === true) {
            onFrame('hit', next);
          } else if (frame.found === false && frame.done === true) {
            onFrame('miss', next);
          } else {
            onFrame('compare', next);
          }
        }
        return next;
      });
    }, delay);
    return () => window.clearInterval(id);
  }, [playing, maxFrames, speed, onFrame, response]);

  return {
    playing,
    setPlaying,
    frameIndex,
    setFrameIndex,
    maxFrames,
    reset: () => {
      setPlaying(false);
      setFrameIndex(0);
    },
  };
}
