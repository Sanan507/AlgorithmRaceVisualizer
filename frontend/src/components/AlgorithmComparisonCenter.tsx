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

// ── Small helpers ─────────────────────────────────────────────────────────────

function YesNo({ value }: { value: boolean }) {
  return (
    <span className={value ? 'yn-badge yn-yes' : 'yn-badge yn-no'}>
      {value ? 'Yes' : 'No'}
    </span>
  );
}

function CodeChip({
  value,
  variant = 'neutral',
}: {
  value: string;
  variant?: 'best' | 'avg' | 'worst' | 'space' | 'neutral';
}) {
  return <code className={`cmp-code cmp-code--${variant}`}>{value || '—'}</code>;
}

// ── Comparison table builders ─────────────────────────────────────────────────

function SortingTable({
  algorithms,
  catalog,
}: {
  algorithms: string[];
  catalog: CatalogResponse;
}) {
  const rows: { label: string; render: (name: string) => React.ReactNode }[] = [
    {
      label: 'Best Case',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.best ?? '—'} variant="best" />
      ),
    },
    {
      label: 'Average Case',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.average ?? '—'} variant="avg" />
      ),
    },
    {
      label: 'Worst Case',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.worst ?? '—'} variant="worst" />
      ),
    },
    {
      label: 'Space',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.space ?? '—'} variant="space" />
      ),
    },
    {
      label: 'Stable',
      render: (n) => <YesNo value={getSortingMeta(n).stable} />,
    },
    {
      label: 'In-Place',
      render: (n) => <YesNo value={getSortingMeta(n).inPlace} />,
    },
    {
      label: 'Typical Use',
      render: (n) => (
        <span className="cmp-use-case">{getSortingMeta(n).useCase}</span>
      ),
    },
  ];

  return (
    <div className="cmp-table-wrapper">
      <table className="cmp-table">
        <thead>
          <tr>
            <th className="cmp-prop-col">Property</th>
            {algorithms.map((alg) => (
              <th key={alg}>{alg}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="cmp-prop-label">{row.label}</td>
              {algorithms.map((alg) => (
                <td key={alg} className="cmp-value-cell">
                  {row.render(alg)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SearchingTable({
  algorithms,
  catalog,
}: {
  algorithms: string[];
  catalog: CatalogResponse;
}) {
  const rows: { label: string; render: (name: string) => React.ReactNode }[] = [
    {
      label: 'Best Case',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.best ?? '—'} variant="best" />
      ),
    },
    {
      label: 'Average Case',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.average ?? '—'} variant="avg" />
      ),
    },
    {
      label: 'Worst Case',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.worst ?? '—'} variant="worst" />
      ),
    },
    {
      label: 'Space',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.space ?? '—'} variant="space" />
      ),
    },
    {
      label: 'Requirements',
      render: (n) => (
        <span className="cmp-use-case">{getSearchingMeta(n).requirements}</span>
      ),
    },
    {
      label: 'Strengths',
      render: (n) => (
        <span className="cmp-strength">{getSearchingMeta(n).strengths}</span>
      ),
    },
    {
      label: 'Weaknesses',
      render: (n) => (
        <span className="cmp-weakness">{getSearchingMeta(n).weaknesses}</span>
      ),
    },
  ];

  return (
    <div className="cmp-table-wrapper">
      <table className="cmp-table">
        <thead>
          <tr>
            <th className="cmp-prop-col">Property</th>
            {algorithms.map((alg) => (
              <th key={alg}>{alg}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="cmp-prop-label">{row.label}</td>
              {algorithms.map((alg) => (
                <td key={alg} className="cmp-value-cell">
                  {row.render(alg)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PathfindingTable({
  algorithms,
  catalog,
}: {
  algorithms: string[];
  catalog: CatalogResponse;
}) {
  const rows: { label: string; render: (name: string) => React.ReactNode }[] = [
    {
      label: 'Time Complexity',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.average ?? '—'} variant="avg" />
      ),
    },
    {
      label: 'Space Complexity',
      render: (n) => (
        <CodeChip value={catalog.complexity[n]?.space ?? '—'} variant="space" />
      ),
    },
    {
      label: 'Complete',
      render: (n) => <YesNo value={getPathfindingMeta(n).complete} />,
    },
    {
      label: 'Optimal',
      render: (n) => <YesNo value={getPathfindingMeta(n).optimal} />,
    },
    {
      label: 'Weighted Graph',
      render: (n) => <YesNo value={getPathfindingMeta(n).weighted} />,
    },
    {
      label: 'Best Use Case',
      render: (n) => (
        <span className="cmp-use-case">{getPathfindingMeta(n).bestFor}</span>
      ),
    },
    {
      label: 'Advantage',
      render: (n) => (
        <span className="cmp-strength">{getPathfindingMeta(n).advantage}</span>
      ),
    },
    {
      label: 'Limitation',
      render: (n) => (
        <span className="cmp-weakness">{getPathfindingMeta(n).limitation}</span>
      ),
    },
  ];

  return (
    <div className="cmp-table-wrapper">
      <table className="cmp-table">
        <thead>
          <tr>
            <th className="cmp-prop-col">Property</th>
            {algorithms.map((alg) => (
              <th key={alg}>{alg}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="cmp-prop-label">{row.label}</td>
              {algorithms.map((alg) => (
                <td key={alg} className="cmp-value-cell">
                  {row.render(alg)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Pseudocode / Explanation Tab Pane ────────────────────────────────────────

function AlgoTabPanel({
  algorithms,
  type,
  catalog,
}: {
  algorithms: string[];
  type: 'sorting' | 'searching' | 'pathfinding';
  catalog: CatalogResponse;
}) {
  const [active, setActive] = useState(0);
  const alg = algorithms[active] ?? algorithms[0];
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
    weaknessText = `Best-case: ${info?.best ?? '—'} · Avg: ${info?.average ?? '—'} · Worst: ${info?.worst ?? '—'} · Space: ${info?.space ?? '—'}`;
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
    <div className="algo-tab-section">
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
      <div className="algo-tab-content">
        {/* Theory paragraph */}
        <p className="algo-theory-text">
          {info?.theory ?? 'Select an algorithm to view its explanation.'}
        </p>

        {/* Strengths / Weaknesses row */}
        <div className="algo-sw-grid">
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
          <div className="algo-pseudocode-wrap">
            <span className="algo-pseudocode-label">Pseudocode</span>
            <pre className="algo-pseudocode">{info.pseudocode}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AlgorithmComparisonCenter({
  algorithms,
  type,
  catalog,
}: AlgorithmComparisonCenterProps) {
  const title =
    algorithms.length > 1
      ? algorithms.join(' vs ')
      : algorithms[0] ?? 'Algorithm';

  return (
    <section className="panel compact algo-comparison-center">
      {/* Header */}
      <div className="cmp-header">
        <div className="section-title">Algorithm Comparison Center</div>
        <div className="cmp-subtitle">{title}</div>
      </div>

      {/* Comparison Table */}
      <div className="cmp-body">
        <div className="cmp-table-section">
          <h4 className="cmp-section-heading">
            Theoretical Properties
          </h4>
          {type === 'sorting' && (
            <SortingTable algorithms={algorithms} catalog={catalog} />
          )}
          {type === 'searching' && (
            <SearchingTable algorithms={algorithms} catalog={catalog} />
          )}
          {type === 'pathfinding' && (
            <PathfindingTable algorithms={algorithms} catalog={catalog} />
          )}
        </div>

        {/* Tabbed Pseudocode / Explanation */}
        <div className="cmp-tab-section">
          <h4 className="cmp-section-heading">
            Pseudocode &amp; Explanation
          </h4>
          <AlgoTabPanel algorithms={algorithms} type={type} catalog={catalog} />
        </div>
      </div>
    </section>
  );
}
