import { Moon, Volume2 } from 'lucide-react';

export function SettingsPage({
  darkMode,
  setDarkMode,
  sound,
  setSound
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  sound: boolean;
  setSound: (value: boolean) => void;
}) {
  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Presentation controls for demos, recordings, and portfolio walkthroughs.</p>
        </div>
      </header>
      <section className="settings-grid">
        <label className="settings-card">
          <Moon size={22} />
          <div>
            <strong>Dark Mode</strong>
            <span>Switch between deep dashboard and light presentation modes.</span>
          </div>
          <input type="checkbox" checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} />
        </label>
        <label className="settings-card">
          <Volume2 size={22} />
          <div>
            <strong>Sound Effects</strong>
            <span>Reserved for web audio cues during comparisons, swaps, and wins.</span>
          </div>
          <input type="checkbox" checked={sound} onChange={(event) => setSound(event.target.checked)} />
        </label>
      </section>
    </main>
  );
}
