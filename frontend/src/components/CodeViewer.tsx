import { useState, useRef, useEffect, useCallback } from 'react';
import type { SimulationFrame } from '../models/types';
import {
  getAlgorithmCodeSnippet,
  type SupportedLanguage,
  type StepOperation,
  type LineHighlight,
} from '../data/algorithmCodeSnippets';
import { Code, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════════════════════ */

export interface CodeViewerProps {
  algorithmName: string;
  currentFrame?: SimulationFrame | null;
  prevFrame?: SimulationFrame | null;
  totalFrames?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  fallbackPseudocode?: string;
  readOnly?: boolean;
}

const LANGUAGES: { id: SupportedLanguage; label: string; icon: string }[] = [
  { id: 'typescript', label: 'TS', icon: '⬡' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'python', label: 'Py', icon: '🐍' },
  { id: 'cpp', label: 'C++', icon: '⚡' },
];

/** Maps an operation to a human-friendly label shown as the badge tag */
const OP_LABELS: Record<StepOperation, string> = {
  compare:  'COMPARING',
  swap:     'SWAPPING',
  pivot:    'PIVOT SELECT',
  region:   'SPLITTING',
  done:     'FINISHED',
  loop:     'ITERATING',
  found:    'FOUND ✓',
  notfound: 'NOT FOUND',
  visit:    'VISITING',
  idle:     '',
};

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function CodeViewer({
  algorithmName,
  currentFrame = null,
  prevFrame = null,
  totalFrames,
  collapsed = false,
  onToggleCollapse,
  className = '',
  fallbackPseudocode = '',
  readOnly = false,
}: CodeViewerProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('java');
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const codeBodyRef = useRef<HTMLDivElement | null>(null);

  // Internal prev-frame tracking when prop is absent (LaneCard passes no prevFrame)
  const lastFrameRef = useRef<SimulationFrame | null>(null);
  const effectivePrev = useRef<SimulationFrame | null>(null);

  if (prevFrame) {
    effectivePrev.current = prevFrame;
  } else if (currentFrame !== lastFrameRef.current) {
    effectivePrev.current = lastFrameRef.current;
    lastFrameRef.current = currentFrame;
  }

  const isCollapsed = onToggleCollapse ? collapsed : internalCollapsed;
  const toggleCollapse = useCallback(() => {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed((v) => !v);
  }, [onToggleCollapse]);

  // ─── Resolve code content & snippet ──────────────────────────
  const snippet = getAlgorithmCodeSnippet(algorithmName, language);
  const codeContent = snippet ? snippet.code : (fallbackPseudocode || '');
  const lines = codeContent.split('\n');

  // ─── Determine step operation & highlighted line ─────────────
  let highlight: LineHighlight | null = null;

  if (!readOnly && snippet && currentFrame) {
    let op: StepOperation = 'idle';

    const isPathfinding = Boolean(currentFrame?.steps || currentFrame?.grid || currentFrame?.pathFound);
    const isSearching = Boolean(currentFrame?.searchPath && currentFrame.searchPath.length > 0);

    if (currentFrame.done) {
      if (isPathfinding) {
        op = currentFrame.pathFound ? 'found' : 'notfound';
      } else if (isSearching) {
        op = (currentFrame.foundIndex !== null && currentFrame.foundIndex >= 0) ? 'found' : 'notfound';
      } else {
        op = 'done';
      }
    } else {
      const prev = effectivePrev.current;
      const prevSwaps = prev ? prev.swaps : 0;
      const prevComps = prev ? prev.comparisons : 0;
      const fNum = currentFrame.frame ?? 0;

      const hasNewSwap = currentFrame.swaps > prevSwaps;
      const hasNewComp = currentFrame.comparisons > prevComps ||
        (currentFrame.highlight && currentFrame.highlight.length > 0);

      if (currentFrame.pivotIndex !== undefined && currentFrame.pivotIndex !== -1) {
        op = 'pivot';
      } else if (currentFrame.mergeRegionStart !== undefined && currentFrame.mergeRegionStart !== -1) {
        op = 'region';
      } else if (hasNewSwap) {
        op = 'swap';
      } else if (isPathfinding) {
        // Pathfinding step cycle: loop (ITERATING) -> visit (VISITING) -> compare (EXPLORING)
        const cycle = fNum % 3;
        if (cycle === 0) op = 'loop';
        else if (cycle === 1) op = 'visit';
        else op = 'compare';
      } else if (hasNewComp) {
        // Alternates between loop iteration header and comparison line for active stepping
        op = (fNum % 2 === 0) ? 'loop' : 'compare';
      } else {
        op = 'loop';
      }
    }

    const raw = snippet.getHighlight(op, { frame: currentFrame, totalFrames });
    if (raw.line >= 0 && raw.line < lines.length) {
      highlight = raw;
    }
  }

  // ─── Auto-scroll within container only (never scroll the page) ──
  useEffect(() => {
    const container = codeBodyRef.current;
    const activeLine = activeLineRef.current;
    if (!container || !activeLine) return;

    // Calculate position relative to the scroll container, not the viewport
    const containerRect = container.getBoundingClientRect();
    const lineRect = activeLine.getBoundingClientRect();
    const lineTopInContainer = lineRect.top - containerRect.top + container.scrollTop;
    const lineBottomInContainer = lineTopInContainer + lineRect.height;

    // Only scroll if the active line is outside the visible area of the container
    const visibleTop = container.scrollTop;
    const visibleBottom = container.scrollTop + container.clientHeight;

    if (lineTopInContainer < visibleTop + 10) {
      container.scrollTop = Math.max(0, lineTopInContainer - 20);
    } else if (lineBottomInContainer > visibleBottom - 10) {
      container.scrollTop = lineBottomInContainer - container.clientHeight + 20;
    }
  }, [highlight?.line]);

  // ─── Copy handler ────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (codeContent) {
      navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codeContent]);

  const opClass = highlight ? `cv-op--${highlight.operation}` : '';
  const opLabel = highlight ? OP_LABELS[highlight.operation] : '';
  const isActive = highlight !== null && highlight.operation !== 'idle';

  return (
    <div className={`cv-card ${isCollapsed ? 'cv-card--collapsed' : ''} ${className}`}>

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="cv-header" onClick={toggleCollapse}>
        <div className="cv-header-left">
          <Code size={15} className="cv-icon" />
          <span className="cv-title">{algorithmName}</span>

          {/* Language tabs */}
          <div className="cv-lang-tabs" onClick={(e) => e.stopPropagation()}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                className={`cv-lang-btn ${language === lang.id ? 'cv-lang-btn--active' : ''}`}
                onClick={() => setLanguage(lang.id)}
              >
                <span className="cv-lang-icon">{lang.icon}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cv-header-right">
          {/* Operation badge — only during active execution */}
          {isActive && opLabel && (
            <span className={`cv-op-badge ${opClass}`}>
              <span className="cv-op-dot" />
              {opLabel}
            </span>
          )}

          <button
            type="button" className="cv-action-btn"
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            title="Copy code" aria-label="Copy code"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
          <button
            type="button" className="cv-action-btn"
            onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
            aria-label={isCollapsed ? 'Expand code' : 'Collapse code'}
          >
            {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* ─── Code Body ───────────────────────────────────── */}
      {!isCollapsed && (
        <div className="cv-body" ref={codeBodyRef}>
          <pre className="cv-pre">
            {lines.map((line, idx) => {
              const isHighlighted = highlight?.line === idx;
              const lineOpClass = isHighlighted ? `cv-line--${highlight!.operation}` : '';

              return (
                <div
                  key={idx}
                  ref={isHighlighted ? activeLineRef : undefined}
                  className={`cv-line ${isHighlighted ? 'cv-line--active' : ''} ${lineOpClass}`}
                >
                  <span className="cv-gutter">{idx + 1}</span>
                  <span className="cv-code">{line || ' '}</span>
                  {isHighlighted && (
                    <span className={`cv-indicator ${opClass}`}>
                      ◀ {OP_LABELS[highlight!.operation] || 'Executing'}
                    </span>
                  )}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
