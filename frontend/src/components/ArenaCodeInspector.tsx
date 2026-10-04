/**
 * ArenaCodeInspector.tsx
 * Docked bottom execution tracer and multi-language code inspector (DevTools/LeetCode style).
 * 
 * Features:
 * - Top-edge draggable height resizer (↕ cursor) to resize inspector from 200px to 92vh.
 * - Vertical column splitter resizers (↔ / I cursor) between each lane in side-by-side mode.
 * - Preset height quick-toggles (S, M, L, Fullscreen) + double-click to expand.
 * - Double-click any column splitter to equalize all column widths.
 * - Single-lane "Focus" button on every comparison card with 1-click return to side-by-side.
 * - Multi-language support (TypeScript, Java, Python, C++).
 * - Full fallback pseudocode integration so no algorithm ever displays blank.
 * - Unified Sunset Orange & Violet theme in both Dark and Light modes.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Code,
  X,
  ChevronDown,
  ChevronUp,
  Columns,
  Maximize2,
  Minimize2,
  Terminal,
  Expand,
  RotateCcw,
} from 'lucide-react';
import type { LaneDto, SimulationFrame } from '../models/types';
import { CodeViewer } from './CodeViewer';
import type { SupportedLanguage } from '../data/algorithmCodeSnippets';
import { fallbackCatalog } from '../data/fallbackCatalog';

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

function getFallbackPseudocode(lane: LaneDto | undefined): string {
  if (!lane) return '';
  return (
    lane.complexityInfo?.pseudocode ||
    fallbackCatalog.complexity[lane.name]?.pseudocode ||
    Object.entries(fallbackCatalog.complexity).find(
      ([k]) =>
        k.toLowerCase().replace(/[^a-z0-9]/g, '') ===
        lane.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    )?.[1]?.pseudocode ||
    ''
  );
}

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

  // ─── 1. Height Resizing State ─────────────────────────────────────────
  const [inspectorHeight, setInspectorHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('algoRace_inspectorHeight');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 200 && val <= 1400) return val;
      }
    } catch {}
    return 420;
  });
  const [isResizingHeight, setIsResizingHeight] = useState<boolean>(false);

  // ─── 2. Column Widths & Column Resizing State (Side-by-Side) ──────────
  const [colWidths, setColWidths] = useState<number[]>([]);
  const [isResizingCol, setIsResizingCol] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync selected algorithm from props
  useEffect(() => {
    if (initialAlgorithm && lanes.some((l) => l.name === initialAlgorithm)) {
      setSelectedAlgo(initialAlgorithm);
    } else if (!selectedAlgo && lanes.length > 0) {
      setSelectedAlgo(lanes[0].name);
    }
  }, [initialAlgorithm, lanes, selectedAlgo]);

  // Sync column widths on lane count change or mount
  useEffect(() => {
    if (lanes.length > 0) {
      setColWidths((prev) => {
        if (prev.length === lanes.length) return prev;
        const availableW = window.innerWidth - 32;
        const equalW = Math.floor(availableW / lanes.length);
        const defaultW = Math.max(300, Math.min(equalW, 500));
        return Array(lanes.length).fill(defaultW);
      });
    }
  }, [lanes.length]);

  const handleResetColWidths = useCallback(() => {
    const availableW = window.innerWidth - 32;
    const equalW = Math.floor(availableW / lanes.length);
    const defaultW = Math.max(300, Math.min(equalW, 500));
    setColWidths(Array(lanes.length).fill(defaultW));
  }, [lanes.length]);

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

  // ─── Top Drawer Height Dragging Logic (↕ cursor) ───────────────────────
  const handleStartHeightResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizingHeight(true);
      const startY = e.clientY;
      const startH = inspectorHeight;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = startY - moveEvent.clientY; // upward movement increases drawer height
        const minH = 200;
        const maxH = Math.floor(window.innerHeight * 0.92);
        const newH = Math.max(minH, Math.min(maxH, startH + deltaY));
        setInspectorHeight(newH);
      };

      const onMouseUp = () => {
        setIsResizingHeight(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        try {
          localStorage.setItem('algoRace_inspectorHeight', String(inspectorHeight));
        } catch {}
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [inspectorHeight]
  );

  // ─── Column Splitter Dragging Logic (↔ / I cursor) ─────────────────────
  const handleStartColResize = useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizingCol(true);
      const startX = e.clientX;
      const initialWidths = [...colWidths];

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        setColWidths(() => {
          const next = [...initialWidths];
          const minW = 220; // minimum panel readable width

          if (colIndex < next.length - 1) {
            const sumWidth = initialWidths[colIndex] + initialWidths[colIndex + 1];
            const newW1 = Math.max(minW, Math.min(sumWidth - minW, initialWidths[colIndex] + deltaX));
            const newW2 = sumWidth - newW1;
            next[colIndex] = newW1;
            next[colIndex + 1] = newW2;
          } else {
            next[colIndex] = Math.max(minW, initialWidths[colIndex] + deltaX);
          }
          return next;
        });
      };

      const onMouseUp = () => {
        setIsResizingCol(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [colWidths]
  );

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
      className={`arena-code-inspector ${isFullscreen ? 'arena-code-inspector--fullscreen' : ''} ${
        isResizingHeight || isResizingCol ? 'arena-code-inspector--resizing' : ''
      }`}
      style={{
        height: isFullscreen ? '90vh' : `${inspectorHeight}px`,
        maxHeight: isFullscreen ? '96vh' : '92vh',
      }}
      role="region"
      aria-label="Algorithm Code Execution Inspector"
    >
      {/* ─── Top Edge Window Height Resizer (↕ cursor) ─────────── */}
      <div
        className={`inspector-top-resizer ${isResizingHeight ? 'inspector-top-resizer--active' : ''}`}
        onMouseDown={handleStartHeightResize}
        onDoubleClick={() => setIsFullscreen((prev) => !prev)}
        role="separator"
        aria-orientation="horizontal"
        title="Drag up or down to resize drawer height (Double-click for Fullscreen)"
      >
        <div className="inspector-top-resizer-line" />
        <div className="inspector-top-resizer-handle" />
      </div>

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
                title={`Compare all ${lanes.length} algorithm codes side-by-side with resizable panels`}
              >
                <Columns size={13} />
                <span>Side-by-Side ({lanes.length})</span>
              </button>
            )}
          </nav>
        </div>

        <div className="inspector-header-right">
          {/* Side-by-Side Panel Equalize Action */}
          {isCompareMode && lanes.length >= 2 && (
            <button
              type="button"
              className="inspector-action-btn inspector-action-btn--reset-cols"
              onClick={handleResetColWidths}
              title="Reset panels to equal width"
              aria-label="Equalize panel widths"
            >
              <RotateCcw size={13} />
            </button>
          )}

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

          {/* Height Presets (S / M / L) */}
          <div className="inspector-height-presets" role="group" aria-label="Height presets">
            <button
              type="button"
              className={`inspector-size-chip ${!isFullscreen && inspectorHeight <= 280 ? 'active' : ''}`}
              onClick={() => {
                setIsFullscreen(false);
                setInspectorHeight(260);
              }}
              title="Compact height (260px)"
            >
              S
            </button>
            <button
              type="button"
              className={`inspector-size-chip ${!isFullscreen && inspectorHeight > 280 && inspectorHeight <= 450 ? 'active' : ''}`}
              onClick={() => {
                setIsFullscreen(false);
                setInspectorHeight(420);
              }}
              title="Medium height (420px)"
            >
              M
            </button>
            <button
              type="button"
              className={`inspector-size-chip ${!isFullscreen && inspectorHeight > 450 ? 'active' : ''}`}
              onClick={() => {
                setIsFullscreen(false);
                setInspectorHeight(600);
              }}
              title="Large height (600px)"
            >
              L
            </button>
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
      <div className="inspector-body" ref={containerRef}>
        {isCompareMode && lanes.length >= 2 ? (
          <div className="inspector-compare-track">
            {lanes.map((lane, index) => {
              const frame = activeFrames[index] ?? lane?.frames?.[0] ?? null;
              const width = colWidths[index] ?? 320;
              return (
                <React.Fragment key={lane.name + index}>
                  <div
                    className="inspector-compare-col"
                    style={{
                      width: `${width}px`,
                      minWidth: '220px',
                      flexShrink: 0,
                    }}
                  >
                    <div className="inspector-col-title-bar">
                      <div className="inspector-col-info">
                        <span className="inspector-col-name">{lane.name}</span>
                        <span className="inspector-col-badge">Lane {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        className="inspector-col-focus-btn"
                        onClick={() => handleSelectAlgo(lane.name)}
                        title={`Focus solely on ${lane.name}`}
                      >
                        <Expand size={12} />
                        <span>Focus</span>
                      </button>
                    </div>
                    <CodeViewer
                      algorithmName={lane.name}
                      currentFrame={frame}
                      totalFrames={totalFrames}
                      fallbackPseudocode={getFallbackPseudocode(lane)}
                      language={language}
                      onLanguageChange={setLanguage}
                      hideHeader={true}
                      className="inspector-embedded-cv"
                    />
                  </div>

                  {/* Vertical Column Splitter Resizer (↔ / I cursor) */}
                  {index < lanes.length - 1 && (
                    <div
                      className={`inspector-col-resizer ${isResizingCol ? 'inspector-col-resizer--active' : ''}`}
                      onMouseDown={(e) => handleStartColResize(index, e)}
                      onDoubleClick={handleResetColWidths}
                      role="separator"
                      aria-orientation="vertical"
                      title="Drag left/right to resize panels (Double-click to equalize)"
                    >
                      <div className="inspector-col-resizer-line" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="inspector-single-view">
            <CodeViewer
              algorithmName={selectedAlgo || lanes[0]?.name || ''}
              currentFrame={currentFrameForSelected}
              totalFrames={totalFrames}
              fallbackPseudocode={getFallbackPseudocode(lanes[selectedIndex])}
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
