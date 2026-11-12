import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RaceResponse } from '../models/types';
import { useAudio } from '../context/AudioContext';
import type { SoundName } from './useSound';

export type FrameEvent = 'compare' | 'swap' | 'hit' | 'miss' | 'step';

function dispatchFrameEffects(
  response: RaceResponse | null,
  next: number,
  onFrame?: (event: FrameEvent, frameIndex: number) => void,
  play?: (name: SoundName) => void,
  playToneForValue?: (value: number, minValue: number, maxValue: number, type: 'compare' | 'swap') => void,
  synthEnabled?: boolean
) {
  if (!response) return;
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
    onFrame?.('hit', next);
    if (response.type === 'pathfinding') play?.('pathFound');
    else play?.('searchHit');
  } else if (hasSwap) {
    onFrame?.('swap', next);
    if (synthEnabled && playToneForValue) {
      playToneForValue(activeValue, minVal, maxVal, 'swap');
    } else {
      play?.('swap');
    }
  } else if (hasMiss) {
    onFrame?.('miss', next);
    play?.('searchMiss');
  } else if (isAnyLaneActive) {
    onFrame?.('compare', next);
    if (synthEnabled && playToneForValue) {
      playToneForValue(activeValue, minVal, maxVal, 'compare');
    } else {
      play?.('compare');
    }
  }
}

export function usePlayback(
  response: RaceResponse | null,
  speed: number,
  onFrame?: (event: FrameEvent, frameIndex: number) => void
) {
  const [playing, setPlayingState] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const { play, playToneForValue, audioSettings } = useAudio();

  const responseRef = useRef(response);
  responseRef.current = response;

  const frameIndexRef = useRef(frameIndex);
  frameIndexRef.current = frameIndex;

  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const playRef = useRef(play);
  playRef.current = play;

  const playToneForValueRef = useRef(playToneForValue);
  playToneForValueRef.current = playToneForValue;

  const audioSettingsRef = useRef(audioSettings);
  audioSettingsRef.current = audioSettings;

  const maxFrames = useMemo(() => {
    if (!response?.lanes || response.lanes.length === 0) return 0;
    return response.lanes.reduce((max, lane) => Math.max(max, lane.frames.length), 0);
  }, [response]);

  const maxFramesRef = useRef(maxFrames);
  maxFramesRef.current = maxFrames;

  // Compute a content-based signature for the current simulation dataset
  const responseSignature = useMemo(() => {
    if (!response) return '';
    const laneNames = response.lanes.map((l) => l.name).join(',');
    const initialFrameHashes = response.lanes
      .map((l) => {
        const f0 = l.frames[0];
        if (!f0) return '';
        const arrStr = f0.array ? f0.array.slice(0, 5).join(':') : '';
        const targetStr = f0.foundIndex ?? '';
        return `${arrStr}-${targetStr}`;
      })
      .join('|');
    const dsLen = response.dataset?.length ?? 0;
    const targetVal = response.target ?? '';
    const wallsLen = response.walls?.length ?? 0;
    return `${response.type}-${laneNames}-${dsLen}-${targetVal}-${wallsLen}-${initialFrameHashes}`;
  }, [response]);

  // Only reset frameIndex when actual simulation dataset/run changes, NOT on stream frame updates
  useEffect(() => {
    frameIndexRef.current = 0;
    setFrameIndex(0);
  }, [responseSignature]);

  // Boundary-aware setPlaying: auto-rewinds to 0 if resuming from the end
  const setPlaying = useCallback(
    (action: boolean | ((prev: boolean) => boolean)) => {
      setPlayingState((prev) => {
        const nextPlaying = typeof action === 'function' ? action(prev) : action;
        if (nextPlaying && maxFramesRef.current > 1 && frameIndexRef.current >= maxFramesRef.current - 1) {
          frameIndexRef.current = 0;
          setFrameIndex(0);
        }
        return nextPlaying;
      });
    },
    []
  );

  const hasFrames = maxFrames > 1;

  useEffect(() => {
    if (!playing || !hasFrames) return undefined;
    const delay = Math.max(18, 240 - speed * 21);
    const id = window.setInterval(() => {
      const current = frameIndexRef.current;
      const currentMax = maxFramesRef.current;
      const resp = responseRef.current;

      if (current >= currentMax - 1) {
        const allLanesDone = resp?.lanes.every(
          (lane) => lane.frames[lane.frames.length - 1]?.done === true
        );
        if (allLanesDone) {
          setPlaying(false);
        }
        return;
      }

      const next = current + 1;
      frameIndexRef.current = next;
      setFrameIndex(next);

      dispatchFrameEffects(
        resp,
        next,
        onFrameRef.current,
        playRef.current,
        playToneForValueRef.current,
        audioSettingsRef.current.synthEnabled
      );
    }, delay);

    return () => window.clearInterval(id);
  }, [playing, hasFrames, speed, setPlaying]);

  function stepForward() {
    setPlaying(false);
    const bound = Math.max(0, maxFramesRef.current - 1);
    if (bound === 0) {
      frameIndexRef.current = 0;
      setFrameIndex(0);
      return;
    }
    const next = Math.min(bound, frameIndexRef.current + 1);
    frameIndexRef.current = next;
    setFrameIndex(next);
  }

  function stepBackward() {
    setPlaying(false);
    const next = Math.max(0, frameIndexRef.current - 1);
    frameIndexRef.current = next;
    setFrameIndex(next);
  }

  function seek(index: number) {
    setPlaying(false);
    const bound = Math.max(0, maxFramesRef.current - 1);
    const next = Math.max(0, Math.min(index, bound));
    frameIndexRef.current = next;
    setFrameIndex(next);
  }

  const reset = useCallback(() => {
    setPlaying(false);
    frameIndexRef.current = 0;
    setFrameIndex(0);
  }, [setPlaying]);

  const togglePlay = useCallback(() => {
    setPlaying((prev) => !prev);
  }, [setPlaying]);

  return {
    playing,
    setPlaying,
    togglePlay,
    frameIndex,
    setFrameIndex,
    maxFrames,
    stepForward,
    stepBackward,
    seek,
    reset,
  };
}
