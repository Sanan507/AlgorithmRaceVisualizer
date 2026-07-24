import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Menu, Zap } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
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

import { fallbackCatalog } from './data/fallbackCatalog';

type Page = 'landing' | 'sorting' | 'searching' | 'pathfinding' | 'history' | 'settings';

export default function App() {
  const [active, setActive] = useState<Page>('landing');
  const [catalog, setCatalog] = useState<CatalogResponse>(fallbackCatalog);
  const [error] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('algorace_dark_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { settings: audioSettings, setSettings: setAudioSettings } = useAudioSettings();
  const { play } = useSound(audioSettings);

  useEffect(() => {
    api.catalog()
      .then(setCatalog)
      .catch((err: Error) => {
        console.warn('Catalog API background fetch warning (using fallback catalog):', err.message);
      });
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

  return (
    <AudioCtx.Provider value={{ play, audioSettings, setAudioSettings }}>
      {active === 'landing' ? (
        <LandingPage onNavigate={setActive} />
      ) : (
        <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Mobile Header Bar */}
          <div className="mobile-header-bar">
            <div className="mobile-brand" onClick={() => setActive('landing')}>
              <Zap size={18} className="brand-icon-zap" />
              <strong>AlgoRace</strong>
            </div>
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={22} />
            </button>
          </div>

          <Sidebar
            active={active}
            onChange={setActive}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
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
      )}
      <Analytics />
      <SpeedInsights />
    </AudioCtx.Provider>
  );
}
