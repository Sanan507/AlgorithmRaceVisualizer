import { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasVideoRecorder } from '../utils/canvasRecorder';

export function useCanvasRecorder(arenaName: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const recorderRef = useRef<CanvasVideoRecorder | null>(null);

  useEffect(() => {
    const recorder = new CanvasVideoRecorder();
    recorder.onStateChange = (recording) => {
      setIsRecording(recording);
      if (!recording) setElapsedSeconds(0);
    };
    recorder.onTimeUpdate = (seconds) => {
      setElapsedSeconds(seconds);
    };
    recorderRef.current = recorder;

    return () => {
      if (recorder.getIsRecording()) {
        recorder.stop();
      }
    };
  }, []);

  const toggleRecording = useCallback((canvasSelector = 'canvas') => {
    if (!recorderRef.current) return false;

    if (recorderRef.current.getIsRecording()) {
      recorderRef.current.stop();
      return false;
    } else {
      const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement | null;
      if (!canvas) {
        console.warn(`No canvas found matching selector '${canvasSelector}' to record.`);
        return false;
      }
      return recorderRef.current.start(canvas, {
        fileNamePrefix: `algorace-${arenaName.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  }, [arenaName]);

  const formattedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  return {
    isRecording,
    elapsedSeconds,
    formattedTime,
    toggleRecording,
    stopRecording: () => recorderRef.current?.stop(),
  };
}
