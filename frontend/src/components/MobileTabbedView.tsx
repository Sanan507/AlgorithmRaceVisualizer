import { useState, type ReactNode } from 'react';
import type { RaceLaneResponse } from '../models/types';
import { Layers } from 'lucide-react';

export interface MobileTabbedViewProps {
  lanes: RaceLaneResponse[];
  children: ReactNode[];
}

export function MobileTabbedView({ lanes, children }: MobileTabbedViewProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!lanes || lanes.length === 0) return null;

  return (
    <div className="mobile-tabbed-container">
      {/* Mobile Tab Header */}
      <div className="mobile-tab-header">
        <div className="mobile-tab-label">
          <Layers size={14} /> Race Lanes
        </div>
        <div className="mobile-tab-buttons">
          {lanes.map((lane, index) => (
            <button
              key={lane.name + index}
              type="button"
              className={`mobile-tab-btn ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {lane.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Active Content */}
      <div className="mobile-tab-content">
        {children[activeTab] || children[0]}
      </div>
    </div>
  );
}
