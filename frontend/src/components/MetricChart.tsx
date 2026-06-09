import type { RaceResponse } from '../models/types';

export function MetricChart({ response, metric }: { response: RaceResponse | null; metric: 'comparisons' | 'swaps' | 'steps' }) {
  const max = Math.max(1, ...(response?.lanes.map((lane) => lane.stats[metric]) ?? [1]));
  return (
    <section className="panel compact">
      <div className="section-title">Performance Comparison</div>
      <div className="chart-bars">
        {response?.lanes.map((lane) => (
          <div className="chart-row" key={lane.name}>
            <span>{lane.name}</span>
            <div className="chart-track">
              <div className="chart-fill" style={{ width: `${Math.max(3, (lane.stats[metric] / max) * 100)}%` }} />
            </div>
            <strong>{lane.stats[metric]}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
