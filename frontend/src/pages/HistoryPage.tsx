import type { CatalogResponse } from '../models/types';

export function HistoryPage({ catalog }: { catalog: CatalogResponse }) {
  const groups = [
    { title: 'Sorting', items: catalog.sortingAlgorithms },
    { title: 'Searching', items: catalog.searchingAlgorithms },
    { title: 'Pathfinding', items: catalog.pathfindingAlgorithms }
  ];

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Benchmarks</h1>
          <p>Algorithm complexity reference — time, space, and case-by-case analysis.</p>
        </div>
      </header>
      <section className="matrix">
        {groups.map((group) => (
          <article className="panel" key={group.title}>
            <div className="section-title">{group.title}</div>
            <div className="matrix-list">
              <div className="matrix-row matrix-header">
                <strong>Algorithm</strong>
                <span>Avg Complexity</span>
                <span>Space Complexity</span>
              </div>
              {group.items.map((name) => {
                const info = catalog.complexity[name];
                return (
                  <div className="matrix-row" key={name}>
                    <strong>{name}</strong>
                    <span>{info?.average || '-'}</span>
                    <span>{info?.space || '-'}</span>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
