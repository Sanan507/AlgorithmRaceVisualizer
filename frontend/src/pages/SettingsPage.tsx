import { Moon, Volume2, VolumeX, SlidersHorizontal, AudioWaveform, Volume, User, Github, Linkedin, Mail, BarChart2, Activity, Zap, Clock, Code } from 'lucide-react';
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
    if (enabled) {
      setTimeout(() => play('click'), 60);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Settings & Profile</h1>
          <p>System configuration, audio synthesizer levels, and developer profile.</p>
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
            <span>Switch between deep cyber dashboard and light presentation modes.</span>
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
        <span>Audio Synthesizer</span>
      </div>
      <section className="settings-grid">
        {/* Enable / Disable toggle */}
        <label className="settings-card">
          {audioSettings.soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          <div>
            <strong>Sound Effects</strong>
            <span>
              {audioSettings.soundEnabled
                ? 'Audio cues active — comparisons, swaps, hit/miss pitch changes.'
                : 'Sound is disabled. Enable to hear real-time audio feedback.'}
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
            <span>Overall output level for all AlgoRace audio synthesizer events.</span>
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
            <span>Level for per-event sound synthesis — comparisons, swaps, and search hits.</span>
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

      {/* ── About Developer Section ───────────────────────── */}
      <div className="settings-section-header">
        <span>About Developer</span>
      </div>
      <section className="about-me-card">
        {/* Header Block */}
        <div className="about-me-header">
          <div className="about-avatar">
            <User size={36} />
          </div>
          <div className="about-title-block">
            <h2>AlgoRace</h2>
            <span className="about-author-sub">Created by <strong>Sanan</strong></span>
            <div className="about-badges">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Spring Boot</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">Canvas</span>
            </div>
          </div>
        </div>

        <hr className="about-divider" />

        {/* Why I Built AlgoRace */}
        <div className="about-section-block">
          <h3>Why I Built AlgoRace</h3>
          <p>
            I built <strong>AlgoRace</strong> because Big-O notation and static pseudocode never fully captured how algorithms actually behave for me. O(n log n) tells you the growth rate, but it doesn't show you why Quick Sort pulls ahead of Bubble Sort on the same dataset, or how Dijkstra's algorithm actually explores a graph step by step.
          </p>
          <p>
            AlgoRace turns that into something you can watch and interact with. Sorting algorithms race side by side on identical dataset seeds, search algorithms visualize their space elimination as it happens, and pathfinding runs on 2D grids you can edit and re-run in real time.
          </p>
          <p>
            It's a full-stack project: a <strong>Spring Boot Java backend</strong> generates deterministic simulation steps, a <strong>React 18 + TypeScript frontend</strong> renders them on HTML5 Canvas, and a custom <strong>Web Audio synthesizer</strong> adds sound feedback for comparisons and swaps.
          </p>
        </div>

        <hr className="about-divider" />

        {/* Project Statistics */}
        <div className="about-section-block">
          <h3>📊 Project Statistics</h3>
          <div className="about-stats-grid">
            <div className="about-stat-box">
              <BarChart2 size={20} className="stat-icon text-indigo-400" />
              <div>
                <strong>12+ Algorithms</strong>
                <span>Algorithms Implemented</span>
              </div>
            </div>

            <div className="about-stat-box">
              <Activity size={20} className="stat-icon text-cyan-400" />
              <div>
                <strong>3 Arenas</strong>
                <span>Sorting, Search, Pathfinding</span>
              </div>
            </div>

            <div className="about-stat-box">
              <Zap size={20} className="stat-icon text-emerald-400" />
              <div>
                <strong>60 FPS</strong>
                <span>Hardware Canvas Engine</span>
              </div>
            </div>

            <div className="about-stat-box">
              <Clock size={20} className="stat-icon text-amber-400" />
              <div>
                <strong>Intensive Engineering</strong>
                <span>Full-Stack Development</span>
              </div>
            </div>

            <div className="about-stat-box">
              <Code size={20} className="stat-icon text-purple-400" />
              <div>
                <strong>~5,000+ Lines</strong>
                <span>Clean Modular Codebase</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="about-divider" />

        {/* Tech Stack */}
        <div className="about-section-block">
          <h3>🛠 Tech Stack</h3>
          <div className="about-tech-stack">
            <span className="stack-chip">⚛️ React 18</span>
            <span className="stack-chip">📘 TypeScript</span>
            <span className="stack-chip">☕ Spring Boot 3.4</span>
            <span className="stack-chip">☕ Java 21</span>
            <span className="stack-chip">🎨 HTML5 Canvas 2D</span>
            <span className="stack-chip">🔊 Web Audio API</span>
            <span className="stack-chip">⚡ Vite</span>
            <span className="stack-chip">🎨 CSS3 & Glassmorphism</span>
          </div>
        </div>

        <hr className="about-divider" />

        {/* Social Links */}
        <div className="about-section-block">
          <h3>🌐 Connect & Links</h3>
          <div className="about-social-links">
            <a href="https://github.com/Sanan507" target="_blank" rel="noopener noreferrer" className="social-btn">
              <Github size={18} />
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/sanan-sarwar" target="_blank" rel="noopener noreferrer" className="social-btn">
              <Linkedin size={18} />
              <span>LinkedIn</span>
            </a>
            <a href="mailto:sanansarwar567@gmail.com" className="social-btn">
              <Mail size={18} />
              <span>Email</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
