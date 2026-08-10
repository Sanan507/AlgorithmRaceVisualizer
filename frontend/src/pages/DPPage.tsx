import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, ListOrdered, FileText, Info, ShieldCheck } from 'lucide-react';
import { DPCanvas, DPStep } from '../components/DPCanvas';
import { CodeViewer } from '../components/CodeViewer';
import { Controls } from '../components/Controls';
import { StepExplanationCard } from '../components/StepExplanationCard';
import { VisualizationLegend } from '../components/VisualizationLegend';
import { algorithmMetadata } from '../data/algorithmMetadata';
import { appendHistory } from '../utils/historyStorage';
import { useAudio } from '../context/AudioContext';
import {
  KnapsackItem,
  KNAPSACK_PRESETS,
  STRING_PRESETS,
  validateKnapsackInputs,
  validateStringInputs,
  extractKnapsackResult,
  extractEditDistanceOperations,
  KnapsackSelectedResult,
  EditDistanceOperation,
} from '../utils/dpUtils';

type DPAlgo = 'knapsack' | 'lcs' | 'edit_distance';

export const DPPage: React.FC = () => {
  const { play, playToneForValue, audioSettings } = useAudio();
  const [selectedAlgo, setSelectedAlgo] = useState<DPAlgo>('knapsack');

  const [knapsackCapacity, setKnapsackCapacity] = useState<number>(KNAPSACK_PRESETS.classic.capacity);
  const [items, setItems] = useState<KnapsackItem[]>(KNAPSACK_PRESETS.classic.items);

  const [str1, setStr1] = useState<string>('AGGTAB');
  const [str2, setStr2] = useState<string>('GXTXAYB');

  const [validationError, setValidationError] = useState<string | null>(null);

  const [steps, setSteps] = useState<DPStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(6);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const winnerAnnouncedRef = useRef<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);

  const [rowLabels, setRowLabels] = useState<string[]>([]);
  const [colLabels, setColLabels] = useState<string[]>([]);

  const [knapsackResult, setKnapsackResult] = useState<KnapsackSelectedResult | null>(null);
  const [lcsResultStr, setLcsResultStr] = useState<string>('');
  const [editOps, setEditOps] = useState<EditDistanceOperation[]>([]);

  useEffect(() => {
    winnerAnnouncedRef.current = false;
    userInteractedRef.current = false;
    generateDPSteps();
  }, [selectedAlgo, knapsackCapacity, items, str1, str2]);

  // Handle Playback Timer
  useEffect(() => {
    if (isPlaying) {
      userInteractedRef.current = true;
      const delay = Math.max(100, 1400 - speed * 130);
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, steps.length]);

  // Audio effect on step frame changes — mirrors Sorting/Searching/Pathfinding sound engine
  useEffect(() => {
    if (!isPlaying && currentStepIdx === 0) return;
    const step = steps[currentStepIdx];
    if (!step) return;

    // Base-case initialization frame
    if (currentStepIdx === 0 || (step.activeRow === 0 && step.activeCol === 0)) {
      if (audioSettings.synthEnabled && playToneForValue) {
        playToneForValue(10, 0, 100, 'compare');
      } else {
        play('compare');
      }
      return;
    }

    // Backtracking / optimal path frames
    if (step.backtrackPath && step.backtrackPath.length > 0) {
      play('pathFound');
      return;
    }

    const exp = step.explanation || '';
    const cellVal = step.matrix[step.activeRow]?.[step.activeCol] ?? 0;
    const maxVal = 50;

    if (selectedAlgo === 'lcs' && (exp.includes('Match') || exp.includes('matches'))) {
      play('searchHit');
    } else if (selectedAlgo === 'lcs' && (exp.includes('mismatch') || exp.includes('No match'))) {
      play('searchMiss');
    } else if (step.dependentCells && step.dependentCells.length >= 2) {
      if (audioSettings.synthEnabled && playToneForValue) {
        playToneForValue(cellVal, 0, maxVal, 'swap');
      } else {
        play('swap');
      }
    } else {
      if (audioSettings.synthEnabled && playToneForValue) {
        playToneForValue(cellVal, 0, maxVal, 'compare');
      } else {
        play('compare');
      }
    }
  }, [currentStepIdx, isPlaying, steps, selectedAlgo, play, playToneForValue, audioSettings.synthEnabled]);

  const isFinalStep = steps.length > 0 && currentStepIdx === steps.length - 1;

  useEffect(() => {
    if (isFinalStep && steps.length > 0 && userInteractedRef.current && !winnerAnnouncedRef.current) {
      winnerAnnouncedRef.current = true;
      userInteractedRef.current = false;
      play('dpComplete');

      const algoName =
        selectedAlgo === 'knapsack'
          ? '0/1 Knapsack'
          : selectedAlgo === 'lcs'
          ? 'Longest Common Subsequence'
          : 'Edit Distance';

      appendHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        arenaType: 'dp',
        winner: algoName,
        datasetSize: rowLabels.length * colLabels.length,
        datasetType: `Matrix (${rowLabels.length}x${colLabels.length})`,
        replayParams: {
          page: 'dp',
          algo: selectedAlgo,
        },
        lanes: [
          {
            name: algoName,
            comparisons: steps.length,
            steps: steps.length,
            timeMs: Math.round(steps.length * 15),
            rank: 1,
          },
        ],
      });
    }
  }, [isFinalStep, steps.length, selectedAlgo, rowLabels.length, colLabels.length, play]);

  const generateDPSteps = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setValidationError(null);

    if (selectedAlgo === 'knapsack') {
      const validation = validateKnapsackInputs(knapsackCapacity, items);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid inputs');
        return;
      }

      const N = items.length;
      const W = knapsackCapacity;
      const rLabels = ['Ø (0)', ...items.map((it, i) => `Item ${i + 1} (w:${it.weight}, v:${it.value})`)];
      const cLabels = Array.from({ length: W + 1 }, (_, i) => `${i}`);
      setRowLabels(rLabels);
      setColLabels(cLabels);

      const dp: number[][] = Array.from({ length: N + 1 }, () => Array(W + 1).fill(-1));
      const generatedSteps: DPStep[] = [];

      for (let w = 0; w <= W; w++) dp[0][w] = 0;
      for (let i = 0; i <= N; i++) dp[i][0] = 0;

      generatedSteps.push({
        matrix: dp.map((row) => [...row]),
        activeRow: 0,
        activeCol: 0,
        explanation: 'Initialized base cases: 0 items or 0 capacity yields value 0.',
        codeLine: 1,
        decisionFormula: 'dp[i][w] = 0 (for i=0 or w=0)',
      });

      for (let i = 1; i <= N; i++) {
        const item = items[i - 1];
        for (let w = 1; w <= W; w++) {
          let formula = '';
          const deps: { row: number; col: number; label?: string }[] = [];

          if (item.weight <= w) {
            const excludeVal = dp[i - 1][w];
            const includeVal = dp[i - 1][w - item.weight] + item.value;
            dp[i][w] = Math.max(excludeVal, includeVal);

            deps.push({ row: i - 1, col: w, label: 'Exclude' });
            deps.push({ row: i - 1, col: w - item.weight, label: '+Val' });
            formula = `dp[${i}][${w}] = max(exclude:${excludeVal}, include:${includeVal}) = ${dp[i][w]}`;
          } else {
            dp[i][w] = dp[i - 1][w];
            deps.push({ row: i - 1, col: w, label: 'Carry Over' });
            formula = `dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]} (Weight > Cap)`;
          }

          generatedSteps.push({
            matrix: dp.map((row) => [...row]),
            activeRow: i,
            activeCol: w,
            dependentCells: deps,
            explanation: `Evaluating Item ${i} (w=${item.weight}, v=${item.value}) at capacity ${w}. Max value: ${dp[i][w]}`,
            codeLine: item.weight <= w ? 4 : 3,
            decisionFormula: formula,
          });
        }
      }

      const backtrack: { row: number; col: number }[] = [];
      let currI = N;
      let currW = W;
      while (currI > 0 && currW > 0) {
        backtrack.push({ row: currI, col: currW });
        if (dp[currI][currW] !== dp[currI - 1][currW]) {
          const item = items[currI - 1];
          currW -= item.weight;
        }
        currI -= 1;
      }
      backtrack.push({ row: currI, col: currW });

      generatedSteps.push({
        matrix: dp.map((row) => [...row]),
        activeRow: N,
        activeCol: W,
        backtrackPath: backtrack,
        explanation: `Knapsack Table Complete! Maximum value: ${dp[N][W]}. Optimal items path backtracked.`,
        codeLine: 5,
        decisionFormula: `Max Profit = ${dp[N][W]}`,
        resultValue: dp[N][W],
      });

      setSteps(generatedSteps);
      setKnapsackResult(extractKnapsackResult(dp, items, W));
    } else if (selectedAlgo === 'lcs') {
      const validation = validateStringInputs(str1, str2);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid string inputs');
        return;
      }

      const m = str1.length;
      const n = str2.length;
      const rLabels = ['Ø', ...str1.split('').map((ch, i) => `S1[${i + 1}]: ${ch}`)];
      const cLabels = ['Ø', ...str2.split('').map((ch, i) => `S2[${i + 1}]: ${ch}`)];
      setRowLabels(rLabels);
      setColLabels(cLabels);

      const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(-1));
      const generatedSteps: DPStep[] = [];

      for (let j = 0; j <= n; j++) dp[0][j] = 0;
      for (let i = 0; i <= m; i++) dp[i][0] = 0;

      generatedSteps.push({
        matrix: dp.map((r) => [...r]),
        activeRow: 0,
        activeCol: 0,
        explanation: 'Initialized base cases: 0 length strings match with 0 length subsequence.',
        codeLine: 1,
        decisionFormula: 'dp[i][j] = 0 (for i=0 or j=0)',
      });

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const ch1 = str1[i - 1];
          const ch2 = str2[j - 1];
          const deps: { row: number; col: number; label?: string }[] = [];
          let formula = '';

          if (ch1 === ch2) {
            dp[i][j] = 1 + dp[i - 1][j - 1];
            deps.push({ row: i - 1, col: j - 1, label: 'Match +1' });
            formula = `Match '${ch1}' === '${ch2}': dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`;
          } else {
            const top = dp[i - 1][j];
            const left = dp[i][j - 1];
            dp[i][j] = Math.max(top, left);
            deps.push({ row: i - 1, col: j, label: 'Top' });
            deps.push({ row: i, col: j - 1, label: 'Left' });
            formula = `Mismatch '${ch1}' !== '${ch2}': dp[${i}][${j}] = max(top:${top}, left:${left}) = ${dp[i][j]}`;
          }

          generatedSteps.push({
            matrix: dp.map((r) => [...r]),
            activeRow: i,
            activeCol: j,
            dependentCells: deps,
            explanation: `Comparing S1[${i}]='${ch1}' vs S2[${j}]='${ch2}'. LCS score: ${dp[i][j]}`,
            codeLine: ch1 === ch2 ? 3 : 4,
            decisionFormula: formula,
          });
        }
      }

      const backtrack: { row: number; col: number }[] = [];
      let bi = m;
      let bj = n;
      let lcsChars: string[] = [];

      while (bi > 0 && bj > 0) {
        backtrack.push({ row: bi, col: bj });
        if (str1[bi - 1] === str2[bj - 1]) {
          lcsChars.push(str1[bi - 1]);
          bi--; bj--;
        } else if (dp[bi - 1][bj] >= dp[bi][bj - 1]) {
          bi--;
        } else {
          bj--;
        }
      }
      backtrack.push({ row: bi, col: bj });
      const finalLcsStr = lcsChars.reverse().join('');
      setLcsResultStr(finalLcsStr);

      generatedSteps.push({
        matrix: dp.map((r) => [...r]),
        activeRow: m,
        activeCol: n,
        backtrackPath: backtrack,
        explanation: `LCS Computed! Longest Common Subsequence: "${finalLcsStr}" (Length: ${dp[m][n]}).`,
        codeLine: 5,
        decisionFormula: `LCS = "${finalLcsStr}"`,
        resultValue: finalLcsStr,
      });

      setSteps(generatedSteps);
    } else {
      const validation = validateStringInputs(str1, str2);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid string inputs');
        return;
      }

      const m = str1.length;
      const n = str2.length;
      const rLabels = ['Ø', ...str1.split('').map((ch, i) => `S1[${i + 1}]: ${ch}`)];
      const cLabels = ['Ø', ...str2.split('').map((ch, i) => `S2[${i + 1}]: ${ch}`)];
      setRowLabels(rLabels);
      setColLabels(cLabels);

      const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(-1));
      const generatedSteps: DPStep[] = [];

      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 0; i <= m; i++) dp[i][0] = i;

      generatedSteps.push({
        matrix: dp.map((r) => [...r]),
        activeRow: 0,
        activeCol: 0,
        explanation: 'Initialized base cases: Cost of converting string to/from empty string is its length.',
        codeLine: 1,
        decisionFormula: 'dp[i][0]=i, dp[0][j]=j',
      });

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const ch1 = str1[i - 1];
          const ch2 = str2[j - 1];
          const deps: { row: number; col: number; label?: string }[] = [];
          let formula = '';

          if (ch1 === ch2) {
            dp[i][j] = dp[i - 1][j - 1];
            deps.push({ row: i - 1, col: j - 1, label: 'Keep (0)' });
            formula = `Match '${ch1}' === '${ch2}': dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}`;
          } else {
            const replaceCost = dp[i - 1][j - 1] + 1;
            const deleteCost = dp[i - 1][j] + 1;
            const insertCost = dp[i][j - 1] + 1;
            dp[i][j] = Math.min(replaceCost, deleteCost, insertCost);

            deps.push({ row: i - 1, col: j - 1, label: 'Replace +1' });
            deps.push({ row: i - 1, col: j, label: 'Delete +1' });
            deps.push({ row: i, col: j - 1, label: 'Insert +1' });
            formula = `Min(Repl:${replaceCost}, Del:${deleteCost}, Ins:${insertCost}) = ${dp[i][j]}`;
          }

          generatedSteps.push({
            matrix: dp.map((r) => [...r]),
            activeRow: i,
            activeCol: j,
            dependentCells: deps,
            explanation: `Evaluating S1[${i}]='${ch1}' vs S2[${j}]='${ch2}'. Min edit distance: ${dp[i][j]}`,
            codeLine: ch1 === ch2 ? 3 : 5,
            decisionFormula: formula,
          });
        }
      }

      const ops = extractEditDistanceOperations(dp, str1, str2);
      setEditOps(ops);

      const backtrack: { row: number; col: number }[] = [];
      let bi = m;
      let bj = n;
      while (bi > 0 || bj > 0) {
        backtrack.push({ row: bi, col: bj });
        if (bi > 0 && bj > 0 && str1[bi - 1] === str2[bj - 1]) {
          bi--; bj--;
        } else if (bi > 0 && bj > 0 && dp[bi][bj] === dp[bi - 1][bj - 1] + 1) {
          bi--; bj--;
        } else if (bj > 0 && dp[bi][bj] === dp[bi][bj - 1] + 1) {
          bj--;
        } else if (bi > 0 && dp[bi][bj] === dp[bi - 1][bj] + 1) {
          bi--;
        } else {
          break;
        }
      }
      backtrack.push({ row: 0, col: 0 });

      generatedSteps.push({
        matrix: dp.map((r) => [...r]),
        activeRow: m,
        activeCol: n,
        backtrackPath: backtrack,
        explanation: `Edit Distance computed! Total minimum edits: ${dp[m][n]}.`,
        codeLine: 6,
        resultValue: dp[m][n],
      });

      setSteps(generatedSteps);
    }
  };

  const handleItemChange = (id: string, field: 'weight' | 'value', val: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: isNaN(val) ? 1 : val } : it)));
  };

  const handleAddItem = () => {
    if (items.length >= 7) return;
    setItems([...items, { id: `${Date.now()}`, weight: 2, value: 3 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const handleKnapsackPreset = (presetKey: 'classic' | 'compact' | 'heavy') => {
    const p = KNAPSACK_PRESETS[presetKey];
    setKnapsackCapacity(p.capacity);
    setItems(p.items);
  };

  const metadata = algorithmMetadata[
    selectedAlgo === 'knapsack' ? '0/1 Knapsack' : selectedAlgo === 'lcs' ? 'Longest Common Subsequence' : 'Edit Distance'
  ] || {
    name: 'Dynamic Programming',
    description: 'Solves complex optimization problems by breaking them down into overlapping subproblems.',
    timeComplexity: 'O(N * W)',
    spaceComplexity: 'O(N * W)',
    pseudocode: ['dp[i][j] = optimal_subproblem()'],
  };

  const currentStep = steps[currentStepIdx] || null;

  return (
    <main className="page dp-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers className="text-purple-400" size={28} />
            <h1>Dynamic Programming Arena</h1>
          </div>
          <p className="text-muted">Interactive matrix table visualizers for classical DP algorithms</p>
        </div>

        <div className="algo-tab-strip">
          <button type="button" className={`algo-tab-btn ${selectedAlgo === 'knapsack' ? 'algo-tab-btn--active active' : ''}`} onClick={() => setSelectedAlgo('knapsack')}>
            0/1 Knapsack
          </button>
          <button type="button" className={`algo-tab-btn ${selectedAlgo === 'lcs' ? 'algo-tab-btn--active active' : ''}`} onClick={() => setSelectedAlgo('lcs')}>
            LCS (Subsequence)
          </button>
          <button type="button" className={`algo-tab-btn ${selectedAlgo === 'edit_distance' ? 'algo-tab-btn--active active' : ''}`} onClick={() => setSelectedAlgo('edit_distance')}>
            Edit Distance
          </button>
        </div>
      </header>

      {validationError && (
        <div className="validation-alert-banner" style={{ marginBottom: '16px' }}>
          <span className="alert-icon">⚠️</span>
          <span>{validationError}</span>
          <button type="button" className="close-banner-btn" onClick={() => setValidationError(null)}>✕</button>
        </div>
      )}

      <section className="panel config-panel">
        {selectedAlgo === 'knapsack' ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="field-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Knapsack Capacity:</span>
                <strong style={{ color: 'var(--accent-2, #c084fc)', fontSize: '1.1rem' }}>{knapsackCapacity}</strong>
                <input type="range" min="3" max="14" value={knapsackCapacity} onChange={(e) => setKnapsackCapacity(Number(e.target.value))} style={{ width: '140px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Presets:</span>
                <button type="button" className="btn btn-secondary" onClick={() => handleKnapsackPreset('classic')} style={{ fontSize: '12px', padding: '4px 10px' }}>Classic</button>
                <button type="button" className="btn btn-secondary" onClick={() => handleKnapsackPreset('compact')} style={{ fontSize: '12px', padding: '4px 10px' }}>Compact</button>
                <button type="button" className="btn btn-secondary" onClick={() => handleKnapsackPreset('heavy')} style={{ fontSize: '12px', padding: '4px 10px' }}>Heavy</button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Item Set ({items.length} / 7 max):</span>
                <button type="button" className="btn btn-secondary" onClick={handleAddItem} disabled={items.length >= 7} style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="dp-item-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {items.map((item, idx) => (
                  <div key={item.id} className="dp-item-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '8px', background: 'var(--panel-2, rgba(255,255,255,0.04))', border: '1px solid var(--line, rgba(255,255,255,0.1))' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-2, #c084fc)' }}>#{idx + 1}</span>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      W:
                      <input type="number" min="1" max="20" value={item.weight} onChange={(e) => handleItemChange(item.id, 'weight', parseInt(e.target.value, 10))} style={{ width: '48px', padding: '2px 4px', fontSize: '12px', borderRadius: '4px' }} />
                    </label>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      V:
                      <input type="number" min="0" max="99" value={item.value} onChange={(e) => handleItemChange(item.id, 'value', parseInt(e.target.value, 10))} style={{ width: '48px', padding: '2px 4px', fontSize: '12px', borderRadius: '4px' }} />
                    </label>
                    <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={items.length <= 1} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Remove Item">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <label className="field">
                <span>String 1 (Target Row)</span>
                <input type="text" value={str1} onChange={(e) => setStr1(e.target.value.toUpperCase())} maxLength={12} style={{ height: '38px' }} />
              </label>
              <label className="field">
                <span>String 2 (Target Column)</span>
                <input type="text" value={str2} onChange={(e) => setStr2(e.target.value.toUpperCase())} maxLength={12} style={{ height: '38px' }} />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Presets:</span>
              {(selectedAlgo === 'lcs' ? STRING_PRESETS.lcs : STRING_PRESETS.editDistance).map((p, idx) => (
                <button key={idx} type="button" className="btn btn-secondary" onClick={() => { setStr1(p.s1); setStr2(p.s2); }} style={{ fontSize: '12px', padding: '4px 10px' }}>
                  "{p.s1}" vs "{p.s2}"
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <Controls
        playing={isPlaying}
        disabled={steps.length === 0}
        onStart={() => {
          userInteractedRef.current = true;
          if (currentStepIdx >= steps.length - 1) {
            setCurrentStepIdx(0);
          }
          setIsPlaying(true);
        }}
        onToggle={() => {
          userInteractedRef.current = true;
          if (!isPlaying && currentStepIdx >= steps.length - 1) {
            setCurrentStepIdx(0);
          }
          setIsPlaying(!isPlaying);
        }}
        onReset={() => {
          setIsPlaying(false);
          setCurrentStepIdx(0);
        }}
        onStepForward={() => {
          setIsPlaying(false);
          setCurrentStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
        }}
        onStepBackward={() => {
          setIsPlaying(false);
          setCurrentStepIdx((prev) => Math.max(0, prev - 1));
        }}
        frameIndex={currentStepIdx}
        maxFrames={steps.length}
        onSeek={(idx) => {
          setIsPlaying(false);
          setCurrentStepIdx(idx);
        }}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '20px' }}>
        <section className="panel" style={{ padding: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill" style={{
                background: isFinalStep ? 'rgba(16, 185, 129, 0.15)' : isPlaying ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isFinalStep ? '#34d399' : isPlaying ? '#60a5fa' : '#fbbf24',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {isFinalStep ? '✓ Solution Computed' : isPlaying ? '⚡ Evaluating Matrix...' : '⏸ Paused'}
              </span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>
                {selectedAlgo === 'knapsack' ? '0/1 Knapsack DP Table' : selectedAlgo === 'lcs' ? 'LCS Subproblem Grid' : 'Edit Distance Operations Table'}
              </strong>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace' }}>
              Dimensions: {rowLabels.length} × {colLabels.length}
            </span>
          </div>

          <DPCanvas rowLabels={rowLabels} colLabels={colLabels} step={currentStep} algoType={selectedAlgo} />
        </section>

        <StepExplanationCard
          frameIndex={currentStepIdx}
          totalFrames={steps.length}
          algorithmName={selectedAlgo === 'knapsack' ? '0/1 Knapsack' : selectedAlgo === 'lcs' ? 'Longest Common Subsequence' : 'Edit Distance'}
          frame={{
            frame: currentStepIdx,
            explanation: currentStep?.explanation || 'Initializing DP matrix...',
            done: isFinalStep,
            status: isFinalStep ? 'Finished' : 'Evaluating',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} className="text-emerald-400" />
              Solution Reconstruction & Summary
            </h3>
            {!isFinalStep ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed var(--line)' }}>
                <Info size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
                Advance simulation to the final step to view the complete optimal solution reconstruction.
              </div>
            ) : (
              <div>
                {selectedAlgo === 'knapsack' && knapsackResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="complexity-grid" style={{ margin: 0 }}>
                      <span>Optimal Total Value<strong style={{ color: '#34d399' }}>{knapsackResult.totalValue}</strong></span>
                      <span>Capacity Utilized<strong>{knapsackResult.totalWeight} / {knapsackCapacity}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Backtracked Selected Items ({knapsackResult.selectedItems.length}):
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {knapsackResult.selectedItems.map((st) => (
                        <div key={st.itemIndex} style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--panel-2, rgba(255,255,255,0.03))', border: '1px solid var(--line, rgba(255,255,255,0.1))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 600 }}>Item #{st.itemIndex}</span>
                          <span style={{ color: 'var(--muted)' }}>Weight: <strong style={{ color: 'var(--text)' }}>{st.weight}</strong> | Value: <strong style={{ color: '#34d399' }}>{st.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedAlgo === 'lcs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="complexity-grid" style={{ margin: 0 }}>
                      <span>Longest Subsequence<strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>"{lcsResultStr}"</strong></span>
                      <span>Subsequence Length<strong>{lcsResultStr.length} chars</strong></span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>The LCS algorithm backtracks through matching character transitions in the table to form the longest shared subsequence between "{str1}" and "{str2}".</p>
                  </div>
                )}
                {selectedAlgo === 'edit_distance' && editOps.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="complexity-grid" style={{ margin: 0 }}>
                      <span>Minimum Edit Distance<strong style={{ color: '#34d399' }}>{editOps.reduce((sum, o) => sum + o.cost, 0)} ops</strong></span>
                      <span>Total Operations<strong>{editOps.length} steps</strong></span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Operation Breakdown:
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {editOps.map((op, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--panel-2, rgba(255,255,255,0.03))', border: '1px solid var(--line, rgba(255,255,255,0.08))', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`status-pill ${op.op === 'KEEP' ? '' : 'warning'}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>{op.op}</span>
                          <span style={{ color: 'var(--muted)' }}>{op.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} className="text-indigo-400" />
              Complexity & Mathematical Model
            </h3>
            <div className="complexity-grid">
              <div>Time Complexity<code>{metadata.timeComplexity}</code></div>
              <div>Space Complexity<code>{metadata.spaceComplexity}</code></div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: '1.6', marginTop: '12px' }}>{metadata.description}</p>
          </div>
        </div>

        <CodeViewer
          algorithmName={selectedAlgo === 'knapsack' ? '0/1 Knapsack' : selectedAlgo === 'lcs' ? 'Longest Common Subsequence' : 'Edit Distance'}
          fallbackPseudocode={metadata.pseudocode?.join('\n') || ''}
        />

        <VisualizationLegend type="dp" />
      </div>
    </main>
  );
};
