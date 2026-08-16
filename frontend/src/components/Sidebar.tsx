import { BarChart3, Binary, GitBranch, History, Settings, ChevronLeft, ChevronRight, LayoutGrid, X, Sun, Moon, Layers, FolderTree, Award } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { AlgoRaceLogo } from './AlgoRaceLogo';

type Page = 'landing' | 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees' | 'quiz' | 'history' | 'settings';

const items = [
  { id: 'landing',     label: 'Overview',            icon: LayoutGrid, hotkey: '0' },
  { id: 'sorting',     label: 'Sorting Arena',       icon: BarChart3,  hotkey: '1' },
  { id: 'searching',   label: 'Search Arena',        icon: Binary,     hotkey: '2' },
  { id: 'pathfinding', label: 'Pathfinding Arena',   icon: GitBranch,  hotkey: '3' },
  { id: 'dp',          label: 'DP Arena',            icon: Layers,     hotkey: '4' },
  { id: 'trees',       label: 'Tree Arena',          icon: FolderTree, hotkey: '5' },
  { id: 'quiz',        label: 'LeetCode Quiz',       icon: Award,      hotkey: 'Q' },
  { id: 'history',     label: 'Benchmarks',          icon: History,    hotkey: 'H' },
  { id: 'settings',    label: 'Settings',            icon: Settings,   hotkey: 'S' },
] as const;

export function Sidebar({
  active,
  onChange,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  darkMode,
  setDarkMode,
}: {
  active: Page;
  onChange: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}) {
  const { play } = useAudio();

  function handleNav(id: Page) {
    play('click');
    onChange(id);
    if (onMobileClose) onMobileClose();
  }

  function handleToggle() {
    play('click');
    onToggle();
  }

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="mobile-drawer-backdrop" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px 24px', borderBottom: '1px solid var(--color-border-line)', marginBottom: '24px' }}>
            <div
              className="brand-link-wrapper"
              role="button"
              tabIndex={0}
              aria-label="Go to Overview"
              onClick={() => handleNav('landing')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav('landing'); } }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <AlgoRaceLogo
                size={collapsed ? 36 : 38}
                showText={!collapsed}
                tagline="Benchmark Engine"
                badge="v2.0"
              />
            </div>
            {mobileOpen && onMobileClose && (
              <button type="button" className="mobile-close-btn" onClick={onMobileClose} aria-label="Close sidebar">
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="nav-list" role="navigation" aria-label="Main Navigation">
            {items.map(({ id, label, icon: Icon, hotkey }) => (
              <button
                key={id}
                className={`nav-item ${active === id ? 'active' : ''}`}
                onClick={() => handleNav(id)}
                title={collapsed ? `${label} (${hotkey})` : undefined}
                aria-label={label}
              >
                <div className="nav-item-glow" />
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{label}</span>
                {!collapsed && hotkey && (
                  <kbd className="sidebar-hotkey-badge">{hotkey}</kbd>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          {setDarkMode && (
            <button
              className="nav-item theme-toggle-item"
              onClick={() => {
                play('click');
                setDarkMode(!darkMode);
              }}
              title={collapsed ? (darkMode ? 'Switch to Light Mode (T)' : 'Switch to Dark Mode (T)') : undefined}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} className="nav-icon text-amber-400" /> : <Moon size={18} className="nav-icon" />}
              <span className="nav-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              {!collapsed && <kbd className="sidebar-hotkey-badge">T</kbd>}
            </button>
          )}

          <button 
            className="nav-item sidebar-toggle-item" 
            onClick={handleToggle} 
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={18} className="nav-icon" /> : <ChevronLeft size={18} className="nav-icon" />}
            <span className="nav-label">Collapse Sidebar</span>
          </button>

          <div className="sidebar-footer">
            <span className="footer-brand">AlgoRace v2.0</span>
            <span>React · Spring Boot · 60 FPS</span>
          </div>
        </div>
      </aside>
    </>
  );
}
