import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { HistoryPage } from './pages/HistoryPage';
import { PathfindingPage } from './pages/PathfindingPage';
import { SearchingPage } from './pages/SearchingPage';
import { SettingsPage } from './pages/SettingsPage';
import { SortingPage } from './pages/SortingPage';
import type { CatalogResponse } from './models/types';
import { api } from './services/api';

type Page = 'sorting' | 'searching' | 'pathfinding' | 'history' | 'settings';

export default function App() {
  const [active, setActive] = useState<Page>('sorting');
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sound, setSound] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    api.catalog().then(setCatalog).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  if (error) {
    return <div className="boot-state">Backend unavailable: {error}</div>;
  }

  if (!catalog) {
    return <div className="boot-state">Loading Algorithm Race Visualizer...</div>;
  }

  return (
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
          <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} sound={sound} setSound={setSound} />
        )}
      </div>
    </div>
  );
}
