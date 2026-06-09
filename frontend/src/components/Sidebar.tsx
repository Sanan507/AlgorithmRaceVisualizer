import { BarChart3, Binary, GitBranch, History, Settings, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

type Page = 'sorting' | 'searching' | 'pathfinding' | 'history' | 'settings';

const items = [
  { id: 'sorting', label: 'Sorting', icon: BarChart3 },
  { id: 'searching', label: 'Searching', icon: Binary },
  { id: 'pathfinding', label: 'Pathfinding', icon: GitBranch },
  { id: 'history', label: 'Comparison', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings }
] as const;

export function Sidebar({
  active,
  onChange,
  collapsed,
  onToggle
}: {
  active: Page;
  onChange: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">
            <Trophy size={22} />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <strong>Algorithm Race</strong>
              <span>Visualizer</span>
            </div>
          )}
        </div>

        <nav className="nav-list">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${active === id ? 'active' : ''}`}
              onClick={() => onChange(id)}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-toggle-btn" onClick={onToggle} title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>

        {!collapsed && (
          <div className="sidebar-footer">
            <span>React + Spring Boot</span>
            <span>DSA Portfolio</span>
          </div>
        )}
      </div>
    </aside>
  );
}
