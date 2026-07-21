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
        if (onFrame && response?.lanes[0]?.frames[next]) {
          const frame = response.lanes[0].frames[next] as Record<string, unknown>;
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

  function stepForward() {
    setPlaying(false);
    setFrameIndex((current) => Math.min(maxFrames - 1, current + 1));
  }

  function stepBackward() {
    setPlaying(false);
    setFrameIndex((current) => Math.max(0, current - 1));
  }

  function seek(index: number) {
    setPlaying(false);
    setFrameIndex(Math.max(0, Math.min(index, maxFrames - 1)));
  }

  return {
    playing,
    setPlaying,
    frameIndex,
    setFrameIndex,
    maxFrames,
    stepForward,
    stepBackward,
    seek,
    reset: () => {
      setPlaying(false);
      setFrameIndex(0);
    },
  };
}
