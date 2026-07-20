import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Sidebar } from './components/Sidebar';
import { HistoryPage } from './pages/HistoryPage';
import { PathfindingPage } from './pages/PathfindingPage';
import { SearchingPage } from './pages/SearchingPage';
import { SettingsPage } from './pages/SettingsPage';
import { SortingPage } from './pages/SortingPage';
import type { CatalogResponse } from './models/types';
import { api } from './services/api';
import { AudioCtx } from './context/AudioContext';
import { useAudioSettings } from './hooks/useAudioSettings';
import { useSound } from './hooks/useSound';

type Page = 'sorting' | 'searching' | 'pathfinding' | 'history' | 'settings';

export default function App() {
  const [active, setActive] = useState<Page>('sorting');
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('algorace_dark_mode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { settings: audioSettings, setSettings: setAudioSettings } = useAudioSettings();
  const { play } = useSound(audioSettings);

  useEffect(() => {
    api.catalog().then(setCatalog).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    try {
      localStorage.setItem('algorace_dark_mode', JSON.stringify(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

  if (error) {
    return (
      <div className="boot-state">
        <div className="boot-card error-card">
          <div className="boot-icon-ring error-ring">
            <span className="boot-dot">!</span>
          </div>
          <h2>Backend Sync Failure</h2>
          <p className="boot-error-text">{error}</p>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="boot-state">
        <div className="boot-card loading-card">
          <div className="cyber-spinner" />
          <p className="boot-loading-text">Initialising AlgoRace Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <AudioCtx.Provider value={{ play, audioSettings, setAudioSettings }}>
      <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          active={active}
          onChange={setActive}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="content-shell">
          {active === 'sorting' && <SortingPage catalog={catalog} />}
          {active === 'searching' && <SearchingPage catalog={catalog} />}
          {active === 'pathfinding' && <PathfindingPage catalog={catalog} />}
          {active === 'history' && <HistoryPage catalog={catalog} />}
          {active === 'settings' && (
            <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
          )}
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </AudioCtx.Provider>
  );
}
