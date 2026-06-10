import { BarChart3, Binary, GitBranch, History, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

type Page = 'sorting' | 'searching' | 'pathfinding' | 'history' | 'settings';

const items = [
  { id: 'sorting',     label: 'Sorting Arena',      icon: BarChart3  },
  { id: 'searching',   label: 'Search Arena',        icon: Binary     },
  { id: 'pathfinding', label: 'Pathfinding Arena',   icon: GitBranch  },
  { id: 'history',     label: 'Benchmarks',          icon: History    },
  { id: 'settings',    label: 'Settings',            icon: Settings   },
] as const;

export function Sidebar({
  active,
  onChange,
  collapsed,
  onToggle,
}: {
  active: Page;
  onChange: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { play } = useAudio();

  function handleNav(id: Page) {
    play('click');
    onChange(id);
  }

  function handleToggle() {
    play('click');
    onToggle();
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">
            <Zap size={22} />
          </div>
          <div className="brand-text">
            <strong>AlgoRace</strong>
            <span>Visualize. Compare. Benchmark.</span>
          </div>
        </div>

        <nav className="nav-list">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${active === id ? 'active' : ''}`}
              onClick={() => handleNav(id)}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button 
          className="nav-item sidebar-toggle-item" 
          onClick={handleToggle} 
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{ 
            border: '1px dashed var(--line)', 
            background: 'rgba(255,255,255,0.02)',
            marginTop: '10px'
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
  );
}
