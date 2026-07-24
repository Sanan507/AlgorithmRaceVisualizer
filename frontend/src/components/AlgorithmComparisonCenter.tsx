import { useState } from 'react';
import type { CatalogResponse } from '../models/types';
import {
  getSortingMeta,
  getSearchingMeta,
  getPathfindingMeta,
} from '../data/algorithmMetadata';

interface AlgorithmComparisonCenterProps {
  algorithms: string[];
  type: 'sorting' | 'searching' | 'pathfinding';
  catalog: CatalogResponse;
}

export function AlgorithmComparisonCenter({
  algorithms,
  type,
  catalog,
}: AlgorithmComparisonCenterProps) {
  const [active, setActive] = useState(0);
  const alg = algorithms[active] ?? algorithms[0] ?? '';
  const info = catalog.complexity[alg];

  const meta =
    type === 'sorting'
      ? getSortingMeta(alg)
      : type === 'searching'
      ? getSearchingMeta(alg)
      : getPathfindingMeta(alg);

  // Build strengths / weaknesses rows depending on type
  let strengthText = '';
  let weaknessText = '';

  if (type === 'sorting') {
    const m = meta as ReturnType<typeof getSortingMeta>;
    strengthText = `${m.stable ? 'Stable sort (preserves relative order of equal elements).' : 'Unstable sort.'} ${m.inPlace ? 'In-place — uses O(1) extra memory.' : 'Not in-place — requires additional memory.'}`;
    weaknessText = `Best: ${info?.best ?? '—'} · Avg: ${info?.average ?? '—'} · Worst: ${info?.worst ?? '—'} · Space: ${info?.space ?? '—'}`;
  } else if (type === 'searching') {
    const m = meta as ReturnType<typeof getSearchingMeta>;
    strengthText = m.strengths;
    weaknessText = m.weaknesses;
  } else {
    const m = meta as ReturnType<typeof getPathfindingMeta>;
    strengthText = m.advantage;
    weaknessText = m.limitation;
  }

  return (
    <section className="panel compact algo-comparison-center">
      {/* Header */}
      <div className="cmp-header" style={{ padding: '20px 24px 16px 24px' }}>
        <div className="section-title">Algorithm Comparison Center</div>
        <div className="cmp-subtitle">Pseudocode &amp; Algorithm Deep-Dive</div>
      </div>

      <div className="algo-tab-section" style={{ padding: '0 24px 24px 24px' }}>
        {/* Tab strip */}
        <div className="algo-tab-strip" role="tablist">
          {algorithms.map((name, i) => (
            <button
              key={name}
              role="tab"
              aria-selected={i === active}
              className={`algo-tab-btn ${i === active ? 'algo-tab-btn--active' : ''}`}
              onClick={() => setActive(i)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="algo-tab-content" style={{ marginTop: '16px' }}>
          {/* Theory paragraph */}
          <p className="algo-theory-text" style={{ fontSize: '0.98rem', lineHeight: 1.6 }}>
            {info?.theory ?? 'Select an algorithm to view its explanation.'}
          </p>

          {/* Strengths / Weaknesses row */}
          <div className="algo-sw-grid" style={{ marginTop: '16px' }}>
            <div className="algo-sw-card algo-sw-card--strength">
              <span className="algo-sw-label">✓ Strengths</span>
              <p>{strengthText}</p>
            </div>
            <div className="algo-sw-card algo-sw-card--weakness">
              <span className="algo-sw-label">✗ Weaknesses</span>
              <p>{weaknessText}</p>
            </div>
          </div>

          {/* Pseudocode */}
          {info?.pseudocode && (
            <div className="algo-pseudocode-wrap" style={{ marginTop: '20px' }}>
              <span className="algo-pseudocode-label">Pseudocode</span>
              <pre className="algo-pseudocode">{info.pseudocode}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
