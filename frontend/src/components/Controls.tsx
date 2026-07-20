import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export function Controls({
  playing,
  disabled,
  onStart,
  onToggle,
  onReset,
  speed,
  onSpeedChange,
  resetLabel = 'Reset'
}: {
  playing: boolean;
  disabled?: boolean;
  onStart: () => void;
  onToggle: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  resetLabel?: string;
}) {
  const { play } = useAudio();

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

  return (
    <div className="control-strip">
      <button className="btn primary" onClick={handleStart} disabled={disabled}>
        <Play size={17} /> Start Race
      </button>
      <button className="btn ghost" onClick={handleToggle} disabled={disabled}>
        {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? 'Pause' : 'Resume'}
      </button>
      <button className="btn secondary" onClick={handleReset}>
        {resetLabel.includes('Random') ? <Shuffle size={17} /> : <RotateCcw size={17} />} {resetLabel}
      </button>
      <label className="speed-control">
        <span className="speed-label">Speed</span>
        <input
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="speed-slider"
        />
        <span className="speed-value">{speed}x</span>
      </label>
    </div>
  );
}
