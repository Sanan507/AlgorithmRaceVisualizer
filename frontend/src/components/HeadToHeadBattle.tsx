import { SortingCanvas } from './SortingCanvas';
import type { RaceResponse, SimulationFrame } from '../models/types';
import { useMemo } from 'react';

interface HeadToHeadBattleProps {
  response: RaceResponse;
  frameA: SimulationFrame;
  frameB: SimulationFrame;
  algoA: string;
  algoB: string;
}

export function HeadToHeadBattle({ response, frameA, frameB, algoA, algoB }: HeadToHeadBattleProps) {
  // Calculate ops for current frame
  const opsA = (frameA?.comparisons ?? 0) + (frameA?.swaps ?? 0);
  const opsB = (frameB?.comparisons ?? 0) + (frameB?.swaps ?? 0);

  // Delta logic (Ops A - Ops B). Positive means A did more ops than B.
  const delta = opsA - opsB;

  // To render a simple differential bar chart, we can scale it to a max value.
  // We'll calculate the maximum possible delta from the entire race history to scale our bar.
  const maxAbsDelta = useMemo(() => {
     let max = 1;
     if (!response || response.lanes.length < 2) return max;
     const laneA = response.lanes[0];
     const laneB = response.lanes[1];
     const maxLen = Math.max(laneA.frames.length, laneB.frames.length);

     for (let i = 0; i < maxLen; i++) {
        const fa = laneA.frames[Math.min(i, laneA.frames.length - 1)];
        const fb = laneB.frames[Math.min(i, laneB.frames.length - 1)];
        const oa = (fa?.comparisons ?? 0) + (fa?.swaps ?? 0);
        const ob = (fb?.comparisons ?? 0) + (fb?.swaps ?? 0);
        const d = Math.abs(oa - ob);
        if (d > max) max = d;
     }
     return max;
  }, [response]);

  const percentage = Math.min(100, (Math.abs(delta) / maxAbsDelta) * 50); // Scale 0-50% for left/right

  return (
    <div className="battle-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>

      {/* Side-by-side Visualizers */}
      <div className="battle-canvases" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
         <div className="battle-lane panel" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>{algoA}</h3>
            <div style={{ height: '240px', background: '#0b0b1e', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <SortingCanvas frame={frameA} algorithm={algoA} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
               <span>Ops: {opsA}</span>
            </div>
         </div>

         <div className="battle-lane panel" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>{algoB}</h3>
            <div style={{ height: '240px', background: '#0b0b1e', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <SortingCanvas frame={frameB} algorithm={algoB} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
               <span>Ops: {opsB}</span>
            </div>
         </div>
      </div>

      {/* Differential Graph Panel */}
      <div className="panel differential-panel" style={{ padding: '24px', textAlign: 'center' }}>
         <h4>Live Operation Lead/Lag Delta</h4>
         <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
             (Algorithm A Ops - Algorithm B Ops)
         </p>

         <div className="delta-bar-wrapper" style={{ position: 'relative', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginTop: '8px' }}>
             {/* Center line */}
             <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.2)', zIndex: 10 }}></div>

             {/* The moving bar */}
             {delta !== 0 && (
                 <div style={{
                     position: 'absolute',
                     top: 0,
                     bottom: 0,
                     background: delta > 0 ? 'var(--rose-500)' : 'var(--emerald-500)',
                     left: delta > 0 ? '50%' : `calc(50% - ${percentage}%)`,
                     width: `${percentage}%`,
                     transition: 'all 0.1s linear',
                 }}></div>
             )}
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
             <span style={{ color: delta < 0 ? 'var(--emerald-400)' : 'inherit' }}>{algoA} Advantage</span>
             <span style={{ fontWeight: 'bold' }}>Delta: {Math.abs(delta)} ops {delta > 0 ? `(${algoB} leading)` : (delta < 0 ? `(${algoA} leading)` : '(Tied)')}</span>
             <span style={{ color: delta > 0 ? 'var(--rose-400)' : 'inherit' }}>{algoB} Advantage</span>
         </div>
      </div>

    </div>
  );
}
