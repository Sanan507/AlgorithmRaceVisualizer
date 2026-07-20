import { Moon, Volume2, VolumeX, SlidersHorizontal, AudioWaveform, Volume } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export function SettingsPage({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}) {
  const { audioSettings, setAudioSettings, play } = useAudio();

  function handleVolumeChange(key: 'masterVolume' | 'effectsVolume', value: number) {
    setAudioSettings({ [key]: value });
  }

  function handleSoundToggle(enabled: boolean) {
    setAudioSettings({ soundEnabled: enabled });
    // Play a test click if re-enabling so user gets immediate feedback
    if (enabled) {
      setTimeout(() => play('click'), 60);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Presentation controls for demos, recordings, and portfolio walkthroughs.</p>
        </div>
      </header>

      {/* ── Appearance ─────────────────────────────────────── */}
      <div className="settings-section-header">
        <span>Appearance</span>
      </div>
      <section className="settings-grid">
        <label className="settings-card">
          <Moon size={22} />
          <div>
            <strong>Dark Mode</strong>
            <span>Switch between deep dashboard and light presentation modes.</span>
          </div>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(event) => setDarkMode(event.target.checked)}
          />
        </label>
      </section>

      {/* ── Audio ──────────────────────────────────────────── */}
      <div className="settings-section-header">
        <span>Audio</span>
      </div>
      <section className="settings-grid">

        {/* Enable / Disable toggle */}
        <label className="settings-card">
          {audioSettings.soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          <div>
            <strong>Sound Effects</strong>
            <span>
              {audioSettings.soundEnabled
                ? 'Audio cues active — comparisons, swaps, race events.'
                : 'Sound is disabled. Enable to hear audio feedback.'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={audioSettings.soundEnabled}
            onChange={(event) => handleSoundToggle(event.target.checked)}
          />
        </label>

        {/* Master Volume */}
        <div className="settings-card settings-card--slider">
          <SlidersHorizontal size={22} className={audioSettings.soundEnabled ? '' : 'icon-muted'} />
          <div className="settings-slider-body">
            <strong>Master Volume</strong>
            <span>Overall output level for all AlgoRace audio.</span>
            <div className="settings-slider-row">
              <Volume size={14} className="icon-muted" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.masterVolume}
                disabled={!audioSettings.soundEnabled}
                onChange={(e) => handleVolumeChange('masterVolume', Number(e.target.value))}
                className="settings-slider"
              />
              <Volume2 size={14} className="icon-muted" />
              <span className="settings-slider-value">
                {Math.round(audioSettings.masterVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Effects Volume */}
        <div className="settings-card settings-card--slider">
          <AudioWaveform size={22} className={audioSettings.soundEnabled ? '' : 'icon-muted'} />
          <div className="settings-slider-body">
            <strong>Effects Volume</strong>
            <span>Level for per-event sounds — comparisons, swaps, and hits.</span>
            <div className="settings-slider-row">
              <Volume size={14} className="icon-muted" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.effectsVolume}
                disabled={!audioSettings.soundEnabled}
                onChange={(e) => handleVolumeChange('effectsVolume', Number(e.target.value))}
                className="settings-slider"
              />
              <Volume2 size={14} className="icon-muted" />
              <span className="settings-slider-value">
                {Math.round(audioSettings.effectsVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
