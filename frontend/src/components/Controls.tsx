import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export function Controls({
  playing,
  disabled,
  onStart,
  onToggle,
  onReset,
  onStepForward,
  onStepBackward,
  frameIndex = 0,
  maxFrames = 0,
  onSeek,
  speed,
  onSpeedChange,
  resetLabel = 'Reset',
  startLabel = 'Start Race',
}: {
  playing: boolean;
  disabled?: boolean;
  onStart: () => void;
  onToggle: () => void;
  onReset: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  frameIndex?: number;
  maxFrames?: number;
  onSeek?: (frameIndex: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  resetLabel?: string;
  startLabel?: string;
}) {
  const { play } = useAudio();

  const timelinePercent = maxFrames > 1 ? Math.min(100, Math.max(0, (frameIndex / (maxFrames - 1)) * 100)) : 0;
  const speedPercent = Math.min(100, Math.max(0, ((speed - 1) / 9) * 100));

  function handleStart() {
    play('click');
    onStart();
  }

  function handleToggle() {
    play('click');
    onToggle();
  }

  function handleReset() {
    play('click');
    onReset();
  }

  function handleStepBack() {
    play('click');
    onStepBackward?.();
  }

  function handleStepForward() {
    play('click');
    onStepForward?.();
  }

  return (
    <div className="control-strip flex-wrap">
      <div className="control-group">
        <motion.button 
          className="btn primary" 
          onClick={handleStart} 
          disabled={disabled} 
          aria-label={startLabel}
          whileHover={disabled ? undefined : { scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
          whileTap={disabled ? undefined : { scale: 0.96 }}
        >
          <Play size={15} fill="currentColor" /> {startLabel}
        </motion.button>
        <motion.button 
          className="btn ghost" 
          onClick={handleToggle} 
          disabled={disabled} 
          aria-label={playing ? 'Pause' : 'Resume'}
          whileHover={disabled ? undefined : { scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
          whileTap={disabled ? undefined : { scale: 0.96 }}
        >
          {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />} {playing ? 'Pause' : 'Resume'}
        </motion.button>
        <motion.button 
          className="btn secondary" 
          onClick={handleReset} 
          disabled={disabled} 
          aria-label={resetLabel}
          whileHover={disabled ? undefined : { scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
          whileTap={disabled ? undefined : { scale: 0.96 }}
        >
          {resetLabel.includes('Random') ? <Shuffle size={16} strokeWidth={2} /> : <RotateCcw size={16} strokeWidth={2.2} />} {resetLabel}
        </motion.button>
      </div>

      {maxFrames > 0 && (
        <div className="control-group step-group">
          <motion.button 
            className="btn icon-btn" 
            onClick={handleStepBack} 
            disabled={disabled || frameIndex <= 0} 
            title="Step Backward" 
            aria-label="Step Backward"
            whileHover={disabled || frameIndex <= 0 ? undefined : { scale: 1.08 }}
            whileTap={disabled || frameIndex <= 0 ? undefined : { scale: 0.92 }}
          >
            <SkipBack size={15} strokeWidth={2} />
          </motion.button>
          <motion.button 
            className="btn icon-btn" 
            onClick={handleStepForward} 
            disabled={disabled || frameIndex >= maxFrames - 1} 
            title="Step Forward" 
            aria-label="Step Forward"
            whileHover={disabled || frameIndex >= maxFrames - 1 ? undefined : { scale: 1.08 }}
            whileTap={disabled || frameIndex >= maxFrames - 1 ? undefined : { scale: 0.92 }}
          >
            <SkipForward size={15} strokeWidth={2} />
          </motion.button>
          {onSeek && (
            <div className="timeline-container">
              <input
                type="range"
                min="0"
                max={Math.max(0, maxFrames - 1)}
                value={frameIndex}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="timeline-slider"
                disabled={disabled}
                aria-label="Timeline"
                style={{ background: `linear-gradient(to right, #fc6d26 ${timelinePercent}%, rgba(252, 109, 38, 0.2) ${timelinePercent}%)` }}
              />
              <span className="frame-counter">
                {frameIndex + 1} / {maxFrames}
              </span>
            </div>
          )}
        </div>
      )}

      <label className="speed-control">
        <span className="speed-label">Speed</span>
        <input
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="speed-slider"
          aria-label="Playback Speed"
          style={{ background: `linear-gradient(to right, #fc6d26 ${speedPercent}%, rgba(252, 109, 38, 0.2) ${speedPercent}%)` }}
        />
        <span className="speed-value">{speed}x</span>
      </label>
    </div>
  );
}
