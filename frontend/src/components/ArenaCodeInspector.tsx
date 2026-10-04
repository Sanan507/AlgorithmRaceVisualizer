/**
 * ArenaCodeInspector.tsx
 * Docked bottom execution tracer and multi-language code inspector (DevTools/LeetCode style).
 * 
 * Features:
 * - Keeps lane cards 100% fixed-height and perfectly aligned (zero layout shifts).
 * - Instant algorithm switching with live status badges.
 * - Side-by-side comparison mode for dual-lane races.
 * - Multi-language support (TypeScript, Java, Python, C++).
 * - Minimize into a sleek dock pill or expand into full inspector.
 * - Unified Sunset Orange & Violet theme in both Dark and Light modes.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Code,
  X,
  ChevronDown,
  ChevronUp,
  Columns,
  Maximize2,
  Minimize2,
  Terminal,
} from 'lucide-react';
import type { LaneDto, SimulationFrame } from '../models/types';
import { CodeViewer } from './CodeViewer';
import type { SupportedLanguage } from '../data/algorithmCodeSnippets';

export interface ArenaCodeInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  lanes: LaneDto[];
  activeFrames: (SimulationFrame | undefined)[];
  totalFrames?: number;
  initialAlgorithm?: string | null;
  onSelectAlgorithm?: (algoName: string) => void;
  arenaType?: 'sorting' | 'searching' | 'pathfinding' | 'general';
}

const LANGUAGES: ReadonlyArray<{ id: SupportedLanguage; label: string; icon: string }> = [
  { id: 'typescript', label: 'TS', icon: '⬡' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'python', label: 'Py', icon: '🐍' },
  { id: 'cpp', label: 'C++', icon: '⚡' },
];

export const ArenaCodeInspector: React.FC<ArenaCodeInspectorProps> = ({
  isOpen,
  onClose,
  lanes = [],
  activeFrames = [],
  totalFrames,
  initialAlgorithm,
  onSelectAlgorithm,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<string>('');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<SupportedLanguage>('java');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync selected algorithm from props
  useEffect(() => {
    if (initialAlgorithm && lanes.some((l) => l.name === initialAlgorithm)) {
      setSelectedAlgo(initialAlgorithm);
    } else if (!selectedAlgo && lanes.length > 0) {
      setSelectedAlgo(lanes[0].name);
    }
  }, [initialAlgorithm, lanes, selectedAlgo]);

  const handleSelectAlgo = useCallback(
    (name: string) => {
      setSelectedAlgo(name);
      setIsCompareMode(false);
      onSelectAlgorithm?.(name);
    },
    [onSelectAlgorithm]
  );

  // Listen for Escape key to close inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Find index and active frame for selected algorithm
  const selectedIndex = useMemo(() => {
    return lanes.findIndex((l) => l.name === selectedAlgo);
  }, [lanes, selectedAlgo]);

  const currentFrameForSelected = useMemo(() => {
    if (selectedIndex >= 0 && activeFrames[selectedIndex]) {
      return activeFrames[selectedIndex];
    }
    return lanes[selectedIndex]?.frames?.[0] ?? null;
  }, [lanes, selectedIndex, activeFrames]);

  if (!isOpen || lanes.length === 0) {
    return null;
  }

  // Minimized floating dock pill
  if (isMinimized) {
    return (
      <aside
        className="arena-inspector-dock-pill"
        onClick={() => setIsMinimized(false)}
        role="button"
        tabIndex={0}
        aria-label="Expand Code Execution Inspector"
        title="Click to expand Code Inspector"
      >
        <div className="inspector-pill-content">
          <Terminal size={14} className="inspector-pill-icon" />
          <span className="inspector-pill-title">
            Code Inspector: {isCompareMode ? 'Side-by-Side' : selectedAlgo || 'Active'}
          </span>
          <span className="inspector-pill-lang">{language.toUpperCase()}</span>
          <ChevronUp size={14} className="inspector-pill-chevron" />
        </div>
      </aside>
    );
  }

  return (
    <section
      className={`arena-code-inspector ${isFullscreen ? 'arena-code-inspector--fullscreen' : ''}`}
      role="region"
      aria-label="Algorithm Code Execution Inspector"
    >
      {/* ─── Inspector Global Header ─────────────────────────── */}
      <header className="inspector-header">
        <div className="inspector-header-left">
          <div className="inspector-brand">
            <Terminal size={15} className="inspector-brand-icon" />
            <span className="inspector-brand-title">Code Inspector</span>
          </div>

          {/* Algorithm Tabs */}
          <nav className="inspector-algo-tabs" aria-label="Algorithms to inspect">
            {lanes.map((lane) => {
              const isSelected = !isCompareMode && selectedAlgo === lane.name;
              return (
                <button
                  key={lane.name}
                  type="button"
                  className={`inspector-algo-tab ${isSelected ? 'inspector-algo-tab--active' : ''}`}
                  onClick={() => handleSelectAlgo(lane.name)}
                  aria-selected={isSelected}
                >
                  <Code size={13} />
                  <span>{lane.name}</span>
                </button>
              );
            })}

            {lanes.length >= 2 && (
              <button
                type="button"
                className={`inspector-algo-tab inspector-algo-tab--compare ${
                  isCompareMode ? 'inspector-algo-tab--active' : ''
                }`}
                onClick={() => setIsCompareMode(true)}
                aria-selected={isCompareMode}
                title={`Compare all ${lanes.length} algorithm codes side-by-side`}
              >
                <Columns size={13} />
                <span>Side-by-Side ({lanes.length})</span>
              </button>
            )}
          </nav>
        </div>

        <div className="inspector-header-right">
          {/* Language Selector */}
          <div className="inspector-lang-tabs" role="tablist" aria-label="Programming Language">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                role="tab"
                aria-selected={language === lang.id}
                className={`inspector-lang-btn ${language === lang.id ? 'inspector-lang-btn--active' : ''}`}
                onClick={() => setLanguage(lang.id)}
              >
                <span className="inspector-lang-icon">{lang.icon}</span>
                {lang.label}
              </button>
            ))}
          </div>

          {/* Window Action Buttons */}
          <div className="inspector-actions">
            <button
              type="button"
              className="inspector-action-btn"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

            <button
              type="button"
              className="inspector-action-btn"
              onClick={() => setIsMinimized(true)}
              title="Minimize to Bottom Dock"
              aria-label="Minimize to Bottom Dock"
            >
              <ChevronDown size={14} />
            </button>

            <button
              type="button"
              className="inspector-action-btn inspector-action-btn--close"
              onClick={onClose}
              title="Close Inspector (Esc)"
              aria-label="Close Inspector"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Inspector Body ──────────────────────────────────── */}
      <div className="inspector-body">
        {isCompareMode && lanes.length >= 2 ? (
          <div
            className="inspector-compare-grid"
            style={{
              gridTemplateColumns: `repeat(${lanes.length}, minmax(280px, 1fr))`,
            }}
          >
            {lanes.map((lane, index) => {
              const frame = activeFrames[index] ?? lane?.frames?.[0] ?? null;
              return (
                <div key={lane.name + index} className="inspector-compare-col">
                  <div className="inspector-col-title-bar">
                    <span className="inspector-col-name">{lane.name}</span>
                    <span className="inspector-col-badge">Lane {index + 1}</span>
                  </div>
                  <CodeViewer
                    algorithmName={lane.name}
                    currentFrame={frame}
                    totalFrames={totalFrames}
                    fallbackPseudocode={lane.pseudocode}
                    language={language}
                    onLanguageChange={setLanguage}
                    hideHeader={true}
                    className="inspector-embedded-cv"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="inspector-single-view">
            <CodeViewer
              algorithmName={selectedAlgo || lanes[0]?.name || ''}
              currentFrame={currentFrameForSelected}
              totalFrames={totalFrames}
              fallbackPseudocode={lanes[selectedIndex]?.pseudocode || ''}
              language={language}
              onLanguageChange={setLanguage}
              hideHeader={true}
              className="inspector-embedded-cv"
            />
          </div>
        )}
      </div>
    </section>
  );
};
