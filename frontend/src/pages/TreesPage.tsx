import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FolderTree, Plus, Trash2, Search, ShieldCheck, CheckCircle2, Play, Dices } from 'lucide-react';
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
  const [activeTraversal, setActiveTraversal] = useState<string | null>(null);
  
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
    setActiveTraversal(null);
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

  // Audio effect on step frame changes
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
    setActiveTraversal(null);
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
    setActiveTraversal(null);
    executeSimulation({
      treeType,
      operation: 'search',
      values: treeValues,
      target: val,
    });
  };

  const runTraversal = (type: 'in' | 'pre' | 'post' | 'level') => {
    userInteractedRef.current = true;
    setActiveTraversal(type);
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
      vals = [10, 20, 30, 40, 50, 25];
    } else {
      const set = new Set<number>();
      while (set.size < 7) {
        set.add(Math.floor(Math.random() * 90) + 10);
      }
      vals = Array.from(set);
    }
    userInteractedRef.current = false;
    setActiveTraversal(null);
    setTreeValues(vals);
    setTraversalResult([]);
    runBuildSimulation(vals);
  };

  const handleClear = () => {
    userInteractedRef.current = false;
    setActiveTraversal(null);
    setTreeValues([]);
    setTraversalResult([]);
    setFrames([{
      frameIndex: 0,
      root: null,
      explanation: 'Tree cleared. Ready for new operations.',
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

  const maxDepth = useMemo(() => {
    function calcDepth(n: any): number {
      if (!n) return 0;
      return 1 + Math.max(calcDepth(n.left), calcDepth(n.right));
    }
    return calcDepth(currentFrame?.root);
  }, [currentFrame?.root]);

  return (
    <main className="page trees-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderTree className="text-amber-400" size={26} />
            <h1>Tree Arena</h1>
          </div>
          <p className="text-muted">Interactive visualizer for BST, self-balancing AVL, and Red-Black trees</p>
        </div>

        {/* Responsive Segmented Algorithm Switcher */}
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

      {/* Main Operations & Config Panel */}
      <section className="tree-toolbar-panel">
        <div className="tree-toolbar-grid">
          {/* Card A: Node Operations */}
          <div className="tree-toolbar-card">
            <div className="tree-toolbar-card-header">
              <span>Node Operations</span>
              <button
                type="button"
                className="btn btn-ghost text-rose"
                onClick={handleClear}
                style={{ padding: '2px 8px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Clear current tree canvas"
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>

            <div className="tree-input-actions">
              <div className="tree-input-group">
                <input
                  type="number"
                  className="tree-num-input"
                  value={insertInput}
                  onChange={(e) => setInsertInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInsert(); }}
                  placeholder="Val..."
                  aria-label="Node value to insert"
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleInsert}
                  style={{ height: '36px', minHeight: '36px', padding: '0 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Insert
                </button>
              </div>

              <div className="tree-input-group">
                <input
                  type="number"
                  className="tree-num-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  placeholder="Val..."
                  aria-label="Node value to search"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSearch}
                  style={{ height: '36px', minHeight: '36px', padding: '0 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Search size={14} /> Search
                </button>
              </div>
            </div>

            <div className="tree-rule-callout">
              <span>Invariant:</span> In-order traversal yields sorted values (left &lt; root &lt; right).
            </div>
          </div>

          {/* Card B: Presets */}
          <div className="tree-toolbar-card">
            <div className="tree-toolbar-card-header">
              <span>Quick Presets</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{treeValues.length} nodes loaded</span>
            </div>

            <div className="tree-preset-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handlePreset('standard')}
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                Standard (7)
              </button>
              <button
                type="button"
                className="btn btn-secondary text-amber-400"
                onClick={() => handlePreset('rotation')}
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                title="Unbalanced values sequence that forces tree rotations"
              >
                Rotation Heavy
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handlePreset('random')}
                style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Dices size={14} /> Random
              </button>
            </div>
          </div>
        </div>

        {/* Traversal Toolbar Bar */}
        <div className="tree-traversal-bar">
          <div className="tree-traversal-label">
            <Play size={13} className="text-amber-400" />
            <span>Traversals:</span>
          </div>

          <button
            type="button"
            className={`tree-traversal-btn ${activeTraversal === 'in' ? 'active' : ''}`}
            onClick={() => runTraversal('in')}
          >
            In-Order (L-N-R)
          </button>
          <button
            type="button"
            className={`tree-traversal-btn ${activeTraversal === 'pre' ? 'active' : ''}`}
            onClick={() => runTraversal('pre')}
          >
            Pre-Order (N-L-R)
          </button>
          <button
            type="button"
            className={`tree-traversal-btn ${activeTraversal === 'post' ? 'active' : ''}`}
            onClick={() => runTraversal('post')}
          >
            Post-Order (L-R-N)
          </button>
          <button
            type="button"
            className={`tree-traversal-btn ${activeTraversal === 'level' ? 'active' : ''}`}
            onClick={() => runTraversal('level')}
          >
            Level-Order (BFS)
          </button>
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

      {/* Main Visualizer Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {/* Canvas Visualizer Card */}
        <section className="tree-canvas-panel">
          <header className="tree-canvas-header">
            <div className="tree-canvas-title-group">
              <span className={`status-pill ${isCompleted ? 'status-badge--finished' : isPlaying ? 'status-badge--running' : 'status-badge--ready'}`}>
                {isCompleted ? '✓ Completed' : isPlaying ? '⚡ Simulating' : 'Ready'}
              </span>
              <h2 className="tree-canvas-title">
                {treeType === 'bst' ? 'Binary Search Tree Canvas' : treeType === 'avl' ? 'AVL Tree (Self-Balancing) Canvas' : 'Red-Black Tree Canvas'}
              </h2>
            </div>

            <div className="tree-canvas-meta">
              <div className="tree-stat-chip">
                <span>Nodes:</span>
                <strong>{treeValues.length}</strong>
              </div>
              {maxDepth > 0 && (
                <div className="tree-stat-chip">
                  <span>Depth:</span>
                  <strong>{maxDepth}</strong>
                </div>
              )}
              {treeType === 'avl' && (
                <div className="tree-stat-chip">
                  <span>Balance:</span>
                  <strong>|BF| ≤ 1</strong>
                </div>
              )}
              {currentFrame?.eventType && currentFrame.eventType !== 'INIT' && (
                <span className="status-pill warning" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                  {currentFrame.eventType.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </header>

          <div className="tree-canvas-viewport">
            <TreeCanvas step={currentFrame} treeType={treeType} />
          </div>
        </section>

        {/* Live Execution Step Inspector */}
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
        <div className="tree-diagnostics-grid">
          {/* Card 1: Traversal Output & Event Stream */}
          <div className="tree-panel-card">
            <h3>
              <CheckCircle2 size={18} className="text-emerald-400" />
              Traversal Output &amp; Step History
            </h3>

            {traversalResult.length > 0 && (
              <div className="tree-traversal-sequence">
                <div className="tree-traversal-sequence-header">
                  Visited Sequence ({traversalResult.length} nodes):
                </div>
                <div className="tree-sequence-badges">
                  {traversalResult.map((val, i) => (
                    <span key={i} className="tree-sequence-badge">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Execution Steps ({frames.length} frames):
              </div>
              <div className="tree-step-stream-list">
                {frames.map((f, idx) => (
                  <div
                    key={idx}
                    className={`tree-step-stream-item ${idx === currentFrameIdx ? 'active' : ''}`}
                    onClick={() => { setIsPlaying(false); setCurrentFrameIdx(idx); }}
                    title={`Click to inspect Step ${idx + 1}`}
                  >
                    <span className="tree-step-num">Step {idx + 1}</span>
                    <span className="tree-step-desc">{f.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Complexity & Structural Invariants */}
          <div className="tree-panel-card">
            <h3>
              <ShieldCheck size={18} className="text-amber-400" />
              Complexity &amp; Structural Invariants
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

            <div className="tree-invariants-desc">
              {treeType === 'bst' && (
                <p>
                  <strong>BST Property:</strong> For every node <code>N</code>, all keys in its left subtree satisfy <code>Key(L) &lt; Key(N)</code>, and all keys in its right subtree satisfy <code>Key(R) &gt; Key(N)</code>. An in-order traversal strictly visits keys in ascending order.
                </p>
              )}
              {treeType === 'avl' && (
                <p>
                  <strong>AVL Invariant:</strong> Strictly self-balancing BST where the height difference (Balance Factor <code>|BF| ≤ 1</code>) between left and right subtrees is preserved at every node. Deviations are immediately corrected using single (LL, RR) or double (LR, RL) rotations in <code>O(1)</code> time.
                </p>
              )}
              {treeType === 'red_black' && (
                <div>
                  <strong>Red-Black Tree Invariants:</strong>
                  <ul style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: 1.6 }}>
                    <li>Every node is colored either Red or Black.</li>
                    <li>The root node is always Black.</li>
                    <li>Red nodes cannot have Red children (no two consecutive Reds).</li>
                    <li>Every simple path from a node to descendant leaves contains the same number of Black nodes.</li>
                  </ul>
                </div>
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
