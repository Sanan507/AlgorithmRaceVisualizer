import { BarChart3, Binary, GitBranch, History, Settings, ChevronLeft, ChevronRight, Zap, LayoutGrid, X, Sun, Moon, Layers, FolderTree } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

type Page = 'landing' | 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees' | 'history' | 'settings';

const items = [
  { id: 'landing',     label: 'Overview',            icon: LayoutGrid },
  { id: 'sorting',     label: 'Sorting Arena',      icon: BarChart3  },
  { id: 'searching',   label: 'Search Arena',        icon: Binary     },
  { id: 'pathfinding', label: 'Pathfinding Arena',   icon: GitBranch  },
  { id: 'dp',          label: 'DP Arena',            icon: Layers     },
  { id: 'trees',       label: 'Tree Arena',          icon: FolderTree },
  { id: 'history',     label: 'Benchmarks',          icon: History    },
  { id: 'settings',    label: 'Settings',            icon: Settings   },
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
          <div className="brand-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div
              className="brand"
              role="button"
              tabIndex={0}
              aria-label="Go to Overview"
              onClick={() => handleNav('landing')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav('landing'); } }}
              style={{ cursor: 'pointer' }}
            >
              <div className="brand-mark">
                <Zap size={22} className="brand-icon-zap" />
              </div>
              <div className="brand-text">
                <strong className="brand-title">AlgoRace</strong>
                <span className="brand-tagline">Algorithm Benchmark Engine</span>
              </div>
            </div>
            {mobileOpen && onMobileClose && (
              <button type="button" className="mobile-close-btn" onClick={onMobileClose} aria-label="Close sidebar">
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="nav-list" role="navigation" aria-label="Main Navigation">
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${active === id ? 'active' : ''}`}
                onClick={() => handleNav(id)}
                title={collapsed ? label : undefined}
                aria-label={label}
              >
                <div className="nav-item-glow" />
                <Icon size={19} className="nav-icon" />
                <span className="nav-label">{label}</span>
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
              title={collapsed ? (darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,0.03)',
                marginBottom: '6px'
              }}
            >
              {darkMode ? <Sun size={18} className="nav-icon text-amber-400" /> : <Moon size={18} className="nav-icon" />}
              <span className="nav-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}

          <button 
            className="nav-item sidebar-toggle-item" 
            onClick={handleToggle} 
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ 
              border: '1px dashed var(--line)', 
              background: 'rgba(255,255,255,0.02)',
              marginTop: '4px'
            }}
          >
            {collapsed ? <ChevronRight size={18} className="nav-icon" /> : <ChevronLeft size={18} className="nav-icon" />}
            <span className="nav-label">Collapse Sidebar</span>
          </button>

          <div className="sidebar-footer">
            <span className="footer-brand">AlgoRace</span>
            <span>React · Spring Boot · Web Audio</span>
          </div>
        </div>
      </aside>
    </>
  );
}
