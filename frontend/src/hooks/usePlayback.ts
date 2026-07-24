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

  // Compute a content-based signature for the current simulation dataset
  const responseSignature = useMemo(() => {
    if (!response) return '';
    const laneNames = response.lanes.map((l) => l.name).join(',');
    const totalFrames = response.lanes.map((l) => l.frames.length).join(',');
    const dsLen = response.dataset?.length ?? 0;
    return `${response.type}-${laneNames}-${totalFrames}-${dsLen}`;
  }, [response]);

  // Only reset frameIndex when actual simulation data changes, NOT on reference re-renders
  useEffect(() => {
    setFrameIndex(0);
  }, [responseSignature]);

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
        if (onFrame && response) {
          let hasSwap = false;
          let hasHit = false;
          let hasMiss = false;
          let isAnyLaneActive = false;

          for (const lane of response.lanes) {
            if (next < lane.frames.length) {
              const frame = lane.frames[next] as Record<string, unknown>;
              const prevFrame = lane.frames[next - 1] as Record<string, unknown> | undefined;
              const wasDoneBefore = prevFrame?.done === true;

              if (!wasDoneBefore) {
                isAnyLaneActive = true;
                if (frame.swapped === true) {
                  hasSwap = true;
                }
                if (frame.found === true || frame.pathFound === true) {
                  hasHit = true;
                }
                if (frame.found === false && frame.done === true) {
                  hasMiss = true;
                }
              }
            }
          }

          if (hasHit) {
            onFrame('hit', next);
          } else if (hasSwap) {
            onFrame('swap', next);
          } else if (hasMiss) {
            onFrame('miss', next);
          } else if (isAnyLaneActive) {
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
