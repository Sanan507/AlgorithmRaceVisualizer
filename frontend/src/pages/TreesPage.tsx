import React, { useState, useEffect, useRef } from 'react';
import { FolderTree, Plus, Trash2, Search, RefreshCw, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TreeCanvas } from '../components/TreeCanvas';
import { CodeViewer } from '../components/CodeViewer';
import { Controls } from '../components/Controls';
import { StepExplanationCard } from '../components/StepExplanationCard';
import { VisualizationLegend } from '../components/VisualizationLegend';
import { algorithmMetadata } from '../data/algorithmMetadata';
import { api } from '../services/api';
import { generateClientTreeSimulation } from '../utils/treeSimulator';
import { TreeSimulationFrame, TreeSimulationRequest } from '../models/types';
import { appendHistory } from '../utils/historyStorage';
import { useAudio } from '../context/AudioContext';

type TreeType = 'bst' | 'avl' | 'red_black';

export const TreesPage: React.FC = () => {
  const { play, playToneForValue, audioSettings } = useAudio();
  const [treeType, setTreeType] = useState<TreeType>('bst');
  const [insertInput, setInsertInput] = useState<string>('42');
  const [searchInput, setSearchInput] = useState<string>('42');
  
  // Tree values state
  const [treeValues, setTreeValues] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  
  // Replay State
  const [frames, setFrames] = useState<TreeSimulationFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(6);
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const winnerAnnouncedRef = useRef<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);

  // Initialize or re-run simulation when treeType or treeValues change
  useEffect(() => {
    winnerAnnouncedRef.current = false;
    userInteractedRef.current = false;
    runBuildSimulation(treeValues);
  }, [treeType]);

  // Handle Playback Timer
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(100, 1400 - speed * 130);
      timerRef.current = setInterval(() => {
        setCurrentFrameIdx((prev) => {
          if (prev >= frames.length - 1) {
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
  }, [isPlaying, speed, frames.length]);

  // Audio effect on step frame changes — mirrors Sorting/Searching/Pathfinding sound engine
  useEffect(() => {
    if (!isPlaying && currentFrameIdx === 0) return;
    const currentFrame = frames[currentFrameIdx];
    if (!currentFrame) return;

    const evt = currentFrame.eventType;
    if (!evt || evt === 'INIT') return;

    let activeVal: number | null | undefined = currentFrame.activeNodeVal;
    if ((activeVal === undefined || activeVal === null) && treeValues.length > 0) {
      activeVal = treeValues[currentFrameIdx % treeValues.length];
    }
    const minVal = treeValues.length > 0 ? Math.min(...treeValues) : 1;
    const maxVal = treeValues.length > 0 ? Math.max(...treeValues) : 100;

    if (evt === 'SEARCH_FOUND' || evt === 'FOUND' || evt === 'SEARCH_HIT') {
      play('searchHit');
    } else if (evt === 'SEARCH_NOT_FOUND') {
      play('searchMiss');
    } else if (evt.startsWith('ROTATION_') || evt === 'RECOLOR') {
      if (audioSettings.synthEnabled && playToneForValue && typeof activeVal === 'number') {
        playToneForValue(activeVal, minVal, maxVal, 'swap');
      } else {
        play('swap');
      }
    } else if (evt === 'DUPLICATE_SKIPPED') {
      play('searchMiss');
    } else {
      // INSERT, INSERT_DONE, SEARCH_VISIT, TRAVERSAL_VISIT
      if (audioSettings.synthEnabled && playToneForValue && typeof activeVal === 'number') {
        playToneForValue(activeVal, minVal, maxVal, 'compare');
      } else {
        play('compare');
      }
    }
  }, [currentFrameIdx, isPlaying, frames, treeValues, play, playToneForValue, audioSettings.synthEnabled]);

  const isCompleted = frames.length > 0 && currentFrameIdx === frames.length - 1;

  useEffect(() => {
    if (isCompleted && frames.length > 0 && userInteractedRef.current && !winnerAnnouncedRef.current) {
      winnerAnnouncedRef.current = true;
      userInteractedRef.current = false;
      play('raceComplete');

      const algoName =
        treeType === 'bst'
          ? 'Binary Search Tree'
          : treeType === 'avl'
          ? 'AVL Tree'
          : 'Red-Black Tree';

      appendHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        arenaType: 'trees',
        winner: algoName,
        datasetSize: treeValues.length,
        datasetType: `${treeType.toUpperCase()} (${treeValues.length} nodes)`,
        replayParams: {
          page: 'trees',
          treeType,
        },
        lanes: [
          {
            name: algoName,
            comparisons: frames.length,
            steps: frames.length,
            timeMs: Math.round(frames.length * 12),
            rank: 1,
          },
        ],
      });
    }
  }, [isCompleted, frames.length, treeType, treeValues.length, play]);

  // Execute Tree Simulation API with fallback
  const executeSimulation = async (req: TreeSimulationRequest) => {
    winnerAnnouncedRef.current = false;
    setIsPlaying(false);
    const isAutoPlayOp = req.operation === 'search' || req.operation === 'traversal';
    try {
      const res = await api.tree(req);
      if (res && res.frames && res.frames.length > 0) {
        setFrames(res.frames);
        const startIdx = isAutoPlayOp ? 0 : Math.max(0, res.frames.length - 1);
        setCurrentFrameIdx(startIdx);
        if (res.traversalOutput) setTraversalResult(res.traversalOutput);
        if (isAutoPlayOp) setIsPlaying(true);
        return;
      }
    } catch {
      // Fallback to client-side simulator
    }

    const fallbackRes = generateClientTreeSimulation(req);
    setFrames(fallbackRes.frames);
    const startIdx = isAutoPlayOp ? 0 : Math.max(0, fallbackRes.frames.length - 1);
    setCurrentFrameIdx(startIdx);
    if (fallbackRes.traversalOutput) setTraversalResult(fallbackRes.traversalOutput);
    if (isAutoPlayOp) setIsPlaying(true);
  };

  const runBuildSimulation = (vals: number[]) => {
    executeSimulation({
      treeType,
      operation: 'build',
      values: vals,
    });
  };

  const handleInsert = () => {
    const val = parseInt(insertInput, 10);
    if (isNaN(val)) return;

    userInteractedRef.current = true;
    const newValues = [...treeValues, val];
    setTreeValues(newValues);

    executeSimulation({
      treeType,
      operation: 'insert',
      values: newValues,
      target: val,
    });
  };

  const handleSearch = () => {
    const val = parseInt(searchInput, 10);
    if (isNaN(val)) return;

    userInteractedRef.current = true;
    executeSimulation({
      treeType,
      operation: 'search',
      values: treeValues,
      target: val,
    });
  };

  const runTraversal = (type: 'in' | 'pre' | 'post' | 'level') => {
    userInteractedRef.current = true;
    executeSimulation({
      treeType,
      operation: 'traversal',
      values: treeValues,
      traversalType: type,
    });
  };

  const handlePreset = (presetType: 'standard' | 'rotation' | 'random') => {
    let vals: number[] = [];
    if (presetType === 'standard') {
      vals = [50, 30, 70, 20, 40, 60, 80];
    } else if (presetType === 'rotation') {
      // Unbalanced sequence to trigger rotations in AVL
      vals = [10, 20, 30, 40, 50, 25];
    } else {
      const set = new Set<number>();
      while (set.size < 7) {
        set.add(Math.floor(Math.random() * 90) + 10);
      }
      vals = Array.from(set);
    }
    userInteractedRef.current = false;
    setTreeValues(vals);
    setTraversalResult([]);
    runBuildSimulation(vals);
  };

  const handleClear = () => {
    userInteractedRef.current = false;
    setTreeValues([]);
    setTraversalResult([]);
    setFrames([{
      frameIndex: 0,
      root: null,
      explanation: 'Cleared tree canvas.',
      eventType: 'CLEAR'
    }]);
    setCurrentFrameIdx(0);
  };

  const metadata = algorithmMetadata[
    treeType === 'bst'
      ? 'Binary Search Tree'
      : treeType === 'avl'
      ? 'AVL Tree'
      : 'Red-Black Tree'
  ] || {
    name: 'Tree Data Structures',
    description: 'Hierarchical node structure supporting logarithmic search, insertion, and deletion.',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(N)',
    pseudocode: ['insert(root, val)', 'balance(node)'],
  };

  const currentFrame = frames[currentFrameIdx] || null;

  return (
    <main className="page trees-page">
      {/* Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderTree className="text-amber-400" size={28} />
            <h1>Tree Arena</h1>
          </div>
          <p className="text-muted">Interactive visualizers for BST, self-balancing AVL, and Red-Black trees</p>
        </div>

        {/* Segmented Controls */}
        <div className="algo-tab-strip">
          <button
            type="button"
            className={`algo-tab-btn ${treeType === 'bst' ? 'algo-tab-btn--active active' : ''}`}
            onClick={() => { setTreeType('bst'); setTraversalResult([]); }}
          >
            Binary Search Tree (BST)
          </button>
          <button
            type="button"
            className={`algo-tab-btn ${treeType === 'avl' ? 'algo-tab-btn--active active' : ''}`}
            onClick={() => { setTreeType('avl'); setTraversalResult([]); }}
          >
            AVL Tree (Self-Balancing)
          </button>
          <button
            type="button"
            className={`algo-tab-btn ${treeType === 'red_black' ? 'algo-tab-btn--active active' : ''}`}
            onClick={() => { setTreeType('red_black'); setTraversalResult([]); }}
          >
            Red-Black Tree
          </button>
        </div>
      </header>

      {/* Main Operations & Config Bar */}
      <section className="panel config-panel">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            {/* Input Actions with BST Rule Hint */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    className="tree-num-input"
                    value={insertInput}
                    onChange={(e) => setInsertInput(e.target.value)}
                    placeholder="Value..."
                    style={{ width: '90px', height: '36px' }}
                  />
                  <button type="button" className="btn btn-primary" onClick={handleInsert} style={{ padding: '0 12px', height: '36px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Insert
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    className="tree-num-input"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Value..."
                    style={{ width: '90px', height: '36px' }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleSearch} style={{ padding: '0 12px', height: '36px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Search size={14} /> Search
                  </button>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>
                💡 BST rule: smaller values go left; larger values go right.
              </span>
            </div>

            {/* Presets & Clear */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Presets:</span>
              <button type="button" className="btn btn-secondary" onClick={() => handlePreset('standard')} style={{ fontSize: '12px', padding: '4px 10px' }}>
                Standard
              </button>
              <button type="button" className="btn btn-secondary text-amber-400" onClick={() => handlePreset('rotation')} style={{ fontSize: '12px', padding: '4px 10px' }}>
                Rotation Heavy
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => handlePreset('random')} style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={13} /> Random
              </button>
              <button type="button" className="btn btn-danger" onClick={handleClear} style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={13} /> Clear Tree
              </button>
            </div>
          </div>

          {/* Traversal Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--line, rgba(255,255,255,0.08))', paddingTop: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Traversals:</span>
            <button type="button" className="btn-chip" onClick={() => runTraversal('in')}>In-Order (L-N-R)</button>
            <button type="button" className="btn-chip" onClick={() => runTraversal('pre')}>Pre-Order (N-L-R)</button>
            <button type="button" className="btn-chip" onClick={() => runTraversal('post')}>Post-Order (L-R-N)</button>
            <button type="button" className="btn-chip" onClick={() => runTraversal('level')}>Level-Order (BFS)</button>
          </div>
        </div>
      </section>

      {/* Standardized Replay Controls Bar */}
      <Controls
        playing={isPlaying}
        disabled={frames.length === 0}
        startLabel="Play Build"
        onStart={() => {
          userInteractedRef.current = true;
          if (currentFrameIdx >= frames.length - 1) {
            setCurrentFrameIdx(0);
          }
          setIsPlaying(true);
        }}
        onToggle={() => {
          userInteractedRef.current = true;
          if (!isPlaying && currentFrameIdx >= frames.length - 1) {
            setCurrentFrameIdx(0);
          }
          setIsPlaying(!isPlaying);
        }}
        onReset={() => {
          setIsPlaying(false);
          setCurrentFrameIdx(0);
        }}
        onStepForward={() => {
          setIsPlaying(false);
          setCurrentFrameIdx((prev) => Math.min(prev + 1, frames.length - 1));
        }}
        onStepBackward={() => {
          setIsPlaying(false);
          setCurrentFrameIdx((prev) => Math.max(0, prev - 1));
        }}
        frameIndex={currentFrameIdx}
        maxFrames={frames.length}
        onSeek={(idx) => {
          setIsPlaying(false);
          setCurrentFrameIdx(idx);
        }}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '20px' }}>
        {/* Canvas Visualizer Card */}
        <section className="panel" style={{ padding: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill" style={{
                background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : isPlaying ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isCompleted ? '#34d399' : isPlaying ? '#60a5fa' : '#fbbf24',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {isCompleted ? '✓ Operation Done' : isPlaying ? '⚡ Simulating Tree...' : '⏸ Paused'}
              </span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>
                {treeType === 'bst' ? 'Binary Search Tree Canvas' : treeType === 'avl' ? 'AVL Tree (Self-Balancing) Canvas' : 'Red-Black Tree Canvas'}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace' }}>
              <span>Total Nodes: <strong style={{ color: 'var(--text)' }}>{treeValues.length}</strong></span>
              {currentFrame?.eventType && (
                <span className="status-pill warning" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                  {currentFrame.eventType}
                </span>
              )}
            </div>
          </div>

          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line, rgba(255,255,255,0.08))' }}>
            <TreeCanvas step={currentFrame} treeType={treeType} />
          </div>
        </section>

        {/* AlgoBot Live Step Tutor */}
        <StepExplanationCard
          frameIndex={currentFrameIdx}
          totalFrames={frames.length}
          algorithmName={treeType === 'bst' ? 'Binary Search Tree' : treeType === 'avl' ? 'AVL Tree' : 'Red-Black Tree'}
          frame={{
            frame: currentFrameIdx,
            explanation: currentFrame?.explanation || 'Ready for tree operations...',
            done: isCompleted,
            status: isCompleted ? 'Finished' : 'Simulating',
          }}
        />

        {/* Traversal Output & Timeline Log Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Output & Log Card */}
          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} className="text-emerald-400" />
              Traversal Output & Event Stream
            </h3>

            {traversalResult.length > 0 && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '12px 14px',
                borderRadius: '8px',
                marginBottom: '14px'
              }}>
                <div style={{ color: '#34d399', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Traversal Result Sequence:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {traversalResult.map((val, i) => (
                    <span key={i} style={{
                      background: 'var(--panel-2, rgba(255,255,255,0.04))',
                      border: '1px solid var(--line, rgba(255,255,255,0.1))',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#a7f3d0'
                    }}>
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Step Log ({frames.length} frames):
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {frames.map((f, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setIsPlaying(false); setCurrentFrameIdx(idx); }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: idx === currentFrameIdx ? 'rgba(245, 158, 11, 0.12)' : 'var(--panel-2, rgba(255,255,255,0.03))',
                      border: idx === currentFrameIdx ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--line, rgba(255,255,255,0.08))',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ color: idx === currentFrameIdx ? '#fbbf24' : 'var(--muted)', fontWeight: 700 }}>
                      Step {idx + 1}
                    </span>
                    <span style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      {f.explanation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complexity & Structural Invariants Card */}
          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} className="text-amber-400" />
              Complexity & Structural Invariants
            </h3>

            <div className="complexity-grid">
              <div>
                Time Complexity
                <code>{metadata.timeComplexity}</code>
              </div>
              <div>
                Space Complexity
                <code>{metadata.spaceComplexity}</code>
              </div>
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: '1.6' }}>
              {treeType === 'bst' && (
                <p>
                  <strong>BST Property:</strong> For any node <code style={{ color: 'var(--text)' }}>N</code>, all keys in left subtree are strictly less than <code style={{ color: 'var(--text)' }}>N.val</code>, and all keys in right subtree are strictly greater.
                </p>
              )}
              {treeType === 'avl' && (
                <p>
                  <strong>AVL Invariant:</strong> Self-balancing BST where the height difference (Balance Factor <code style={{ color: '#34d399' }}>|BF| ≤ 1</code>) between left and right subtrees is guaranteed at every node using single (LL, RR) or double (LR, RL) rotations.
                </p>
              )}
              {treeType === 'red_black' && (
                <p>
                  <strong>Red-Black Invariants:</strong>
                  1. Nodes are either Red or Black.<br />
                  2. Root is always Black.<br />
                  3. Red nodes cannot have Red children.<br />
                  4. Every path from root to leaf has equal Black height.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pseudocode & Code Viewer */}
        <CodeViewer
          algorithmName={
            treeType === 'bst'
              ? 'Binary Search Tree'
              : treeType === 'avl'
              ? 'AVL Tree'
              : 'Red-Black Tree'
          }
          fallbackPseudocode={metadata.pseudocode?.join('\n') || ''}
        />

        {/* Visualization Legend */}
        <VisualizationLegend type="trees" />
      </div>
    </main>
  );
};
