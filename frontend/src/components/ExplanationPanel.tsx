import type { ComplexityInfo } from '../models/types';

export function ExplanationPanel({ title, info }: { title: string; info?: ComplexityInfo }) {
  return (
    <section className="panel compact explanation">
      <div className="section-title">{title}</div>
      <p>{info?.theory ?? 'Select an algorithm to view theory and pseudocode.'}</p>
      <div className="complexity-grid">
        <span>Best <strong>{info?.best ?? '-'}</strong></span>
        <span>Average <strong>{info?.average ?? '-'}</strong></span>
        <span>Worst <strong>{info?.worst ?? '-'}</strong></span>
        <span>Space <strong>{info?.space ?? '-'}</strong></span>
      </div>
      <pre>{info?.pseudocode ?? ''}</pre>
    </section>
  );
}
