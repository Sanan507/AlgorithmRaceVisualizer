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
  resetLabel = 'Reset'
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
        <button className="btn primary" onClick={handleStart} disabled={disabled}>
          <Play size={17} /> Start Race
        </button>
        <button className="btn ghost" onClick={handleToggle} disabled={disabled}>
          {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? 'Pause' : 'Resume'}
        </button>
        <button className="btn secondary" onClick={handleReset} disabled={disabled}>
          {resetLabel.includes('Random') ? <Shuffle size={17} /> : <RotateCcw size={17} />} {resetLabel}
        </button>
      </div>

      {maxFrames > 0 && (
        <div className="control-group step-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn icon-btn" onClick={handleStepBack} disabled={disabled || frameIndex <= 0} title="Step Backward">
            <SkipBack size={16} />
          </button>
          <button className="btn icon-btn" onClick={handleStepForward} disabled={disabled || frameIndex >= maxFrames - 1} title="Step Forward">
            <SkipForward size={16} />
          </button>
          {onSeek && (
            <div className="timeline-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="0"
                max={Math.max(0, maxFrames - 1)}
                value={frameIndex}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="timeline-slider"
                disabled={disabled}
                style={{
                  width: '140px',
                  background: `linear-gradient(to right, #0ea5e9 ${timelinePercent}%, rgba(129, 140, 248, 0.2) ${timelinePercent}%)`
                }}
              />
              <span className="frame-counter" style={{ fontSize: '12px', opacity: 0.85, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
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
          style={{
            width: '120px',
            background: `linear-gradient(to right, #0ea5e9 ${speedPercent}%, rgba(129, 140, 248, 0.2) ${speedPercent}%)`
          }}
        />
        <span className="speed-value">{speed}x</span>
      </label>
    </div>
  );
}
