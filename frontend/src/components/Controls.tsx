import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';

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
  return (
    <div className="control-strip">
      <button className="btn primary" onClick={onStart} disabled={disabled}>
        <Play size={17} /> Start Race
      </button>
      <button className="btn ghost" onClick={onToggle} disabled={disabled}>
        {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? 'Pause' : 'Resume'}
      </button>
      <button className="btn secondary" onClick={onReset}>
        {resetLabel.includes('Random') ? <Shuffle size={17} /> : <RotateCcw size={17} />} {resetLabel}
      </button>
      <label className="speed-control">
        <span>Speed</span>
        <input type="range" min="1" max="10" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))} />
      </label>
    </div>
  );
}
