import { useEffect, useMemo, useState } from 'react';
import type { RaceResponse } from '../models/types';
import { useAudio } from '../context/AudioContext';

export type FrameEvent = 'compare' | 'swap' | 'hit' | 'miss' | 'step';

export function usePlayback(
  response: RaceResponse | null,
  speed: number,
  onFrame?: (event: FrameEvent, frameIndex: number) => void
) {
  const [playing, setPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const { play, playToneForValue, audioSettings } = useAudio();

  const maxFrames = useMemo(() => {
    if (!response?.lanes || response.lanes.length === 0) return 0;
    return response.lanes.reduce((max, lane) => Math.max(max, lane.frames.length), 0);
  }, [response]);

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
        if (response) {
          let hasSwap = false;
          let hasHit = false;
          let hasMiss = false;
          let isAnyLaneActive = false;

          let activeValue = 0;
          let minVal = 0;
          let maxVal = 100;

          if (response.dataset && response.dataset.length > 0) {
            minVal = Math.min(...response.dataset);
            maxVal = Math.max(...response.dataset);
          }

          let extractedValue = false;

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

                if (!extractedValue && frame.array && Array.isArray(frame.array)) {
                  if (frame.comparing && Array.isArray(frame.comparing) && frame.comparing.length > 0) {
                    activeValue = frame.array[frame.comparing[0]];
                    extractedValue = true;
                  } else if (frame.highlight && Array.isArray(frame.highlight) && frame.highlight.length > 0) {
                    activeValue = frame.array[frame.highlight[0]];
                    extractedValue = true;
                  }
                }
              }
            }
          }

          if (!extractedValue) {
            activeValue = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
          }

          if (hasHit) {
            if (onFrame) onFrame('hit', next);
            if (response.type === 'pathfinding') play('pathFound');
            else play('searchHit');
          } else if (hasSwap) {
            if (onFrame) onFrame('swap', next);
            if (audioSettings.synthEnabled && playToneForValue) {
              playToneForValue(activeValue, minVal, maxVal, 'swap');
            } else {
              play('swap');
            }
          } else if (hasMiss) {
            if (onFrame) onFrame('miss', next);
            play('searchMiss');
          } else if (isAnyLaneActive) {
            if (onFrame) onFrame('compare', next);
            if (audioSettings.synthEnabled && playToneForValue) {
              playToneForValue(activeValue, minVal, maxVal, 'compare');
            } else {
              play('compare');
            }
          }
        }
        return next;
      });
    }, delay);
    return () => window.clearInterval(id);
  }, [playing, maxFrames, speed, onFrame, response, play, playToneForValue, audioSettings.synthEnabled]);

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
