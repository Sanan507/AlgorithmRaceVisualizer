/**
 * CodeViewer.tsx
 * High-performance, multi-language synchronized algorithm execution tracer.
 * 
 * Features:
 * - Ultra-fast O(1) frame step highlight matching with zero unnecessary re-renders (React.memo).
 * - Multi-language support (TypeScript, Java, Python, C++) with instant snippet switching.
 * - Zero-overhead, pre-compiled syntax tokenization for keywords, types, strings, numbers, & comments.
 * - Smooth, non-blocking container auto-scrolling with zero page-scroll side effects.
 * - Live execution telemetry badges with operation-driven chromatic indicators.
 * - Fully accessible keyboard controls and clipboard export with instant user feedback.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import type { SimulationFrame } from '../models/types';
import {
  getAlgorithmCodeSnippet,
  type SupportedLanguage,
  type StepOperation,
  type LineHighlight,
  type CodeSnippet,
} from '../data/algorithmCodeSnippets';
import { Code, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Types & Interfaces
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

interface Token {
  text: string;
  type: 'kw' | 'type' | 'fn' | 'str' | 'num' | 'cmt' | 'op' | 'plain';
}

/* ═══════════════════════════════════════════════════════════════
   Constants & Metadata
   ═══════════════════════════════════════════════════════════════ */

const LANGUAGES: ReadonlyArray<{ id: SupportedLanguage; label: string; icon: string }> = [
  { id: 'typescript', label: 'TS', icon: '⬡' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'python', label: 'Py', icon: '🐍' },
  { id: 'cpp', label: 'C++', icon: '⚡' },
];

/** Maps an operation to a human-friendly label shown in badges and line tags */
const OP_LABELS: Readonly<Record<StepOperation, string>> = {
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

const KEYWORDS = new Set([
  'function', 'def', 'class', 'public', 'private', 'protected', 'static', 'void',
  'return', 'if', 'else', 'elif', 'for', 'while', 'do', 'const', 'let', 'var',
  'new', 'this', 'self', 'import', 'export', 'from', 'in', 'of', 'and', 'or', 'not',
  'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally',
  'throw', 'throws', 'null', 'nullptr', 'None', 'true', 'false', 'True', 'False',
  'int', 'float', 'double', 'boolean', 'bool', 'char', 'long', 'short', 'auto',
  'vector', 'string', 'Array', 'List', 'Set', 'Map', 'std'
]);

const TYPES = new Set([
  'number', 'string', 'boolean', 'void', 'any', 'never', 'unknown',
  'Integer', 'Boolean', 'Double', 'String', 'PointDto', 'SimulationFrame',
  'int[]', 'String[]', 'vector<int>', 'vector<vector<int>>'
]);

/* ═══════════════════════════════════════════════════════════════
   High-Speed Lexical Tokenizer (Pre-computed on snippet switch)
   ═══════════════════════════════════════════════════════════════ */

function tokenizeLine(line: string): Token[] {
  if (!line) return [{ text: ' ', type: 'plain' }];

  const tokens: Token[] = [];
  const regex = /(\/\/.*|#.*|\/\*.*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|([a-zA-Z_$][a-zA-Z0-9_$]*)|(\b\d+(?:\.\d+)?\b)|(===|!==|==|!=|<=|>=|=>|->|\+\+|--|\+=|-=|\*=|\/=|&&|\|\||[+\-*\/%<>=!&|^~?:])|(\s+)|([^\s\w])/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), type: 'plain' });
    }

    const [full, cmt, str, ident, num, op, ws, punct] = match;

    if (cmt) {
      tokens.push({ text: cmt, type: 'cmt' });
    } else if (str) {
      tokens.push({ text: str, type: 'str' });
    } else if (ident) {
      if (KEYWORDS.has(ident)) {
        tokens.push({ text: ident, type: 'kw' });
      } else if (TYPES.has(ident)) {
        tokens.push({ text: ident, type: 'type' });
      } else {
        const nextChar = line.slice(regex.lastIndex).trimStart()[0];
        if (nextChar === '(') {
          tokens.push({ text: ident, type: 'fn' });
        } else {
          tokens.push({ text: ident, type: 'plain' });
        }
      }
    } else if (num) {
      tokens.push({ text: num, type: 'num' });
    } else if (op) {
      tokens.push({ text: op, type: 'op' });
    } else if (ws || punct) {
      tokens.push({ text: full, type: 'plain' });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: 'plain' });
  }

  return tokens.length > 0 ? tokens : [{ text: line, type: 'plain' }];
}

/* ═══════════════════════════════════════════════════════════════
   Step Operation Classifier
   ═══════════════════════════════════════════════════════════════ */

function detectStepOperation(
  frame: SimulationFrame,
  prev: SimulationFrame | null
): StepOperation {
  const isPathfinding = Boolean(frame.steps || frame.grid || frame.pathFound);
  const isSearching = Boolean(frame.searchPath && frame.searchPath.length > 0);

  if (frame.done) {
    if (isPathfinding) {
      return frame.pathFound ? 'found' : 'notfound';
    }
    if (isSearching) {
      return frame.foundIndex !== null && frame.foundIndex >= 0 ? 'found' : 'notfound';
    }
    return 'done';
  }

  const prevSwaps = prev?.swaps ?? 0;
  const prevComps = prev?.comparisons ?? 0;
  const fNum = frame.frame ?? 0;

  const hasNewSwap = frame.swaps > prevSwaps;
  const hasNewComp =
    frame.comparisons > prevComps || (frame.highlight && frame.highlight.length > 0);

  if (frame.pivotIndex !== undefined && frame.pivotIndex !== -1) {
    return 'pivot';
  }
  if (frame.mergeRegionStart !== undefined && frame.mergeRegionStart !== -1) {
    return 'region';
  }
  if (hasNewSwap) {
    return 'swap';
  }
  if (isPathfinding) {
    const cycle = fNum % 3;
    return cycle === 0 ? 'loop' : cycle === 1 ? 'visit' : 'compare';
  }
  if (hasNewComp) {
    return fNum % 2 === 0 ? 'loop' : 'compare';
  }
  return 'loop';
}

/* ═══════════════════════════════════════════════════════════════
   Memoized Sub-Component: CodeLine
   Only re-renders when highlighted status or active operation changes.
   ═══════════════════════════════════════════════════════════════ */

interface CodeLineProps {
  index: number;
  tokens: Token[];
  isHighlighted: boolean;
  operation?: StepOperation;
  lineRef?: (el: HTMLDivElement | null) => void;
}

const CodeLine = memo(function CodeLine({
  index,
  tokens,
  isHighlighted,
  operation = 'idle',
  lineRef,
}: CodeLineProps) {
  const lineOpClass = isHighlighted ? `cv-line--${operation}` : '';
  const opClass = isHighlighted ? `cv-op--${operation}` : '';

  return (
    <div
      ref={isHighlighted ? lineRef : undefined}
      className={`cv-line ${isHighlighted ? 'cv-line--active' : ''} ${lineOpClass}`}
    >
      <span className="cv-gutter">{index + 1}</span>
      <span className="cv-code">
        {tokens.map((tok, i) =>
          tok.type === 'plain' ? (
            tok.text
          ) : (
            <span key={i} className={`cv-tok--${tok.type}`}>
              {tok.text}
            </span>
          )
        )}
      </span>
      {isHighlighted && (
        <span className={`cv-indicator ${opClass}`}>
          ◀ {OP_LABELS[operation] || 'Executing'}
        </span>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   Main Component: CodeViewer
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

  const codeBodyRef = useRef<HTMLDivElement | null>(null);
  const activeLineElementRef = useRef<HTMLDivElement | null>(null);
  const prevFrameTrackerRef = useRef<SimulationFrame | null>(null);

  // Controlled vs uncontrolled collapse state
  const isCollapsed = onToggleCollapse ? collapsed : internalCollapsed;
  const toggleCollapse = useCallback(() => {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed((prev) => !prev);
  }, [onToggleCollapse]);

  // Track effective previous frame safely across render cycles
  const effectivePrev = prevFrame || prevFrameTrackerRef.current;
  useEffect(() => {
    if (currentFrame) {
      prevFrameTrackerRef.current = currentFrame;
    }
  }, [currentFrame]);

  // ─── 1. Resolve code snippet and pre-tokenize lines (Memoized) ───
  const snippet: CodeSnippet | null = useMemo(() => {
    return getAlgorithmCodeSnippet(algorithmName, language);
  }, [algorithmName, language]);

  const rawCode = useMemo(() => {
    return snippet ? snippet.code : (fallbackPseudocode || '');
  }, [snippet, fallbackPseudocode]);

  const tokenizedLines: Token[][] = useMemo(() => {
    if (!rawCode) return [];
    return rawCode.split('\n').map(tokenizeLine);
  }, [rawCode]);

  // ─── 2. Calculate dynamic highlight state (High-speed O(1)) ───
  const highlight: LineHighlight | null = useMemo(() => {
    if (readOnly || !snippet || !currentFrame) return null;

    const op = detectStepOperation(currentFrame, effectivePrev);
    const raw = snippet.getHighlight(op, { frame: currentFrame, totalFrames });

    if (raw.line >= 0 && raw.line < tokenizedLines.length) {
      return raw;
    }
    return null;
  }, [readOnly, snippet, currentFrame, effectivePrev, totalFrames, tokenizedLines.length]);

  const highlightedLineIndex = highlight?.line ?? -1;
  const activeOperation = highlight?.operation ?? 'idle';

  // ─── 3. Smooth, Container-Bound Auto-Scroll (No Reflow) ───
  const setLineRef = useCallback((el: HTMLDivElement | null) => {
    activeLineElementRef.current = el;
  }, []);

  useEffect(() => {
    if (isCollapsed || highlightedLineIndex < 0) return;

    const container = codeBodyRef.current;
    const activeLine = activeLineElementRef.current;
    if (!container || !activeLine) return;

    const lineTop = activeLine.offsetTop;
    const lineHeight = activeLine.offsetHeight || 22;
    const lineBottom = lineTop + lineHeight;
    const visibleTop = container.scrollTop;
    const visibleBottom = visibleTop + container.clientHeight;
    const PADDING = 28;

    if (lineTop < visibleTop + PADDING) {
      container.scrollTop = Math.max(0, lineTop - PADDING);
    } else if (lineBottom > visibleBottom - PADDING) {
      container.scrollTop = lineBottom - container.clientHeight + PADDING;
    }
  }, [highlightedLineIndex, isCollapsed]);

  // ─── 4. Copy to Clipboard ────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (!rawCode) return;
    navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [rawCode]);

  const opClass = highlight ? `cv-op--${activeOperation}` : '';
  const opLabel = highlight ? OP_LABELS[activeOperation] : '';
  const isActive = highlight !== null && activeOperation !== 'idle';

  return (
    <div
      className={`cv-card ${isCollapsed ? 'cv-card--collapsed' : ''} ${className}`}
      role="region"
      aria-label={`${algorithmName} Code Execution Viewer`}
    >
      {/* ─── Header ──────────────────────────────────────── */}
      <div
        className="cv-header"
        onClick={toggleCollapse}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCollapse();
          }
        }}
      >
        <div className="cv-header-left">
          <Code size={15} className="cv-icon" aria-hidden="true" />
          <span className="cv-title">{algorithmName}</span>

          {/* Language Tabs */}
          <div
            className="cv-lang-tabs"
            onClick={(e) => e.stopPropagation()}
            role="tablist"
            aria-label="Target Programming Language"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                role="tab"
                aria-selected={language === lang.id}
                className={`cv-lang-btn ${language === lang.id ? 'cv-lang-btn--active' : ''}`}
                onClick={() => setLanguage(lang.id)}
              >
                <span className="cv-lang-icon" aria-hidden="true">{lang.icon}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cv-header-right">
          {/* Active Operation Live Badge */}
          {isActive && opLabel && (
            <span className={`cv-op-badge ${opClass}`}>
              <span className="cv-op-dot" aria-hidden="true" />
              {opLabel}
            </span>
          )}

          {/* Copy Button */}
          <button
            type="button"
            className="cv-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title={copied ? 'Copied to clipboard' : 'Copy code'}
            aria-label={copied ? 'Copied code to clipboard' : 'Copy code snippet'}
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            className="cv-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            title={isCollapsed ? 'Expand code view' : 'Collapse code view'}
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
            {tokenizedLines.map((tokens, idx) => {
              const isLineHighlighted = highlightedLineIndex === idx;
              return (
                <CodeLine
                  key={idx}
                  index={idx}
                  tokens={tokens}
                  isHighlighted={isLineHighlighted}
                  operation={isLineHighlighted ? activeOperation : undefined}
                  lineRef={isLineHighlighted ? setLineRef : undefined}
                />
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
