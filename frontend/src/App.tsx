import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Sun, Moon, Menu, Zap } from 'lucide-react';
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

const getPageFromHash = (): Page => {
  const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();
  if (hash === 'sorting' || hash === 'sorting-arena') return 'sorting';
  if (hash === 'searching' || hash === 'search' || hash === 'search-arena') return 'searching';
  if (hash === 'pathfinding' || hash === 'pathfinding-arena') return 'pathfinding';
  if (hash === 'history' || hash === 'benchmarks') return 'history';
  if (hash === 'settings') return 'settings';
  return 'landing';
};

export default function App() {
  const [active, setActive] = useState<Page>(() => getPageFromHash());
  const [catalog, setCatalog] = useState<CatalogResponse>(fallbackCatalog);
  const [error] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('algorace_dark_mode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { settings: audioSettings, setSettings: setAudioSettings } = useAudioSettings();
  const { play } = useSound(audioSettings);

  // Listen to browser back/forward and URL hash updates
  useEffect(() => {
    const handleHashChange = () => {
      setActive(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Synchronize state changes to URL bar hash
  useEffect(() => {
    window.scrollTo(0, 0);
    const targetHash = active === 'landing' ? '' : `#${active}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash || window.location.pathname + window.location.search);
    }
  }, [active]);

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
        <LandingPage onNavigate={setActive} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : (
        <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Mobile Header Bar */}
          <div className="mobile-header-bar">
            <div className="mobile-brand" onClick={() => setActive('landing')}>
              <Zap size={18} className="brand-icon-zap" />
              <strong>AlgoRace</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="mobile-hamburger-btn"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                className="mobile-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          <Sidebar
            active={active}
            onChange={setActive}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
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
