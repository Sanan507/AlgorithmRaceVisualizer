interface LegendItem {
  name: string;
  color: string;
  gradient?: string;
  desc: string;
}

interface VisualizationLegendProps {
  type: 'sorting' | 'searching' | 'pathfinding';
}

export function VisualizationLegend({ type }: VisualizationLegendProps) {
  const legendItems: Record<'sorting' | 'searching' | 'pathfinding', LegendItem[]> = {
    sorting: [
      {
        name: 'Unprocessed',
        color: '#4f46e5',
        gradient: 'linear-gradient(135deg, #818cf8, #4f46e5)',
        desc: 'Elements in the array that are not yet sorted or active.'
      },
      {
        name: 'Comparing',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
        desc: 'The elements currently being compared or analyzed.'
      },
      {
        name: 'Sorted',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #34d399, #059669)',
        desc: 'Elements in their final, correct sorted position.'
      },
      {
        name: 'Pivot Element',
        color: '#d946ef',
        gradient: 'linear-gradient(135deg, #f472b6, #db2777)',
        desc: 'The pivot value used in Quick Sort partition operations.'
      },
      {
        name: 'Heap Boundary',
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
        desc: 'Divider between the max-heap area and the sorted portion in Heap Sort.'
      },
      {
        name: 'Merge Active',
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #22d3ee, #0891b2)',
        desc: 'The active range of sub-arrays being merged in Merge Sort.'
      }
    ],
    searching: [
      {
        name: 'Unvisited',
        color: '#4f46e5',
        gradient: 'linear-gradient(135deg, #818cf8, #4f46e5)',
        desc: 'Elements in the array that have not been inspected.'
      },
      {
        name: 'Current Index',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
        desc: 'The current index being compared with the target value.'
      },
      {
        name: 'Target Found',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #34d399, #059669)',
        desc: 'The target element located successfully in the collection.'
      },
      {
        name: 'Eliminated Range',
        color: '#1e293b',
        gradient: 'linear-gradient(135deg, #334155, #1e293b)',
        desc: 'Indices ruled out by the algorithm (e.g. faded elements outside low/high bounds).'
      },
      {
        name: 'Active Search Area',
        color: '#4f46e5',
        gradient: 'linear-gradient(135deg, #818cf8, #4f46e5)',
        desc: 'The remaining candidate range containing potential matches.'
      }
    ],
    pathfinding: [
      {
        name: 'Unvisited Node',
        color: '#0f172a',
        desc: 'Open grid cells available for traversals.'
      },
      {
        name: 'Visited Node',
        color: '#312e81',
        desc: 'Nodes that have been explored by the pathfinding algorithm.'
      },
      {
        name: 'Frontier Node',
        color: '#4c1d95',
        desc: 'Nodes discovered and placed in the queue but not yet fully expanded.'
      },
      {
        name: 'Current Node',
        color: '#a78bfa',
        desc: 'The active coordinate being inspected at the current step.'
      },
      {
        name: 'Path Found',
        color: '#fbbf24',
        desc: 'The final optimized shortest path connecting start to end.'
      },
      {
        name: 'Wall / Obstacle',
        color: '#1e293b',
        desc: 'Impassable barriers that algorithms must bypass.'
      },
      {
        name: 'Start Node',
        color: '#10b981',
        desc: 'The entry node/source where the path begins.'
      },
      {
        name: 'Goal Node',
        color: '#ef4444',
        desc: 'The exit node/destination target where the path ends.'
      }
    ]
  };

  const currentItems = legendItems[type];

  return (
    <section className="panel compact legend-panel">
      <div className="section-title">Understanding the Visualization</div>
      <div className="legend-grid">
        {currentItems.map((item) => (
          <div className="legend-item" key={item.name}>
            <div 
              className="legend-color-box" 
              style={{ 
                background: item.gradient || item.color,
                border: item.color === '#0f172a' ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }} 
            />
            <div className="legend-details">
              <span className="legend-name">{item.name}</span>
              <span className="legend-desc">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
