import { BarChart3, Binary, GitBranch, History, Settings, Trophy } from 'lucide-react';

type Page = 'sorting' | 'searching' | 'pathfinding' | 'history' | 'settings';

const items = [
  { id: 'sorting', label: 'Sorting', icon: BarChart3 },
  { id: 'searching', label: 'Searching', icon: Binary },
  { id: 'pathfinding', label: 'Pathfinding', icon: GitBranch },
  { id: 'history', label: 'Comparison', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings }
] as const;

export function Sidebar({ active, onChange }: { active: Page; onChange: (page: Page) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Trophy size={26} /></div>
        <div>
          <strong>Algorithm Race</strong>
          <span>Visualizer</span>
        </div>
      </div>

      <nav className="nav-list">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => onChange(id)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>React + Spring Boot</span>
        <span>DSA Portfolio</span>
      </div>
    </aside>
  );
}
