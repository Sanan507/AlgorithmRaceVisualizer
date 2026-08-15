import { useState, useMemo, useRef } from 'react';
import { Sliders, Sparkles, TrendingUp, Info } from 'lucide-react';

interface Props {
  highlightedComplexity?: string;
}

interface ComplexityClass {
  id: string;
  name: string;
  label: string;
  color: string;
  glowColor: string;
  description: string;
  examples: string;
  calc: (n: number) => number;
}

const COMPLEXITY_CLASSES: ComplexityClass[] = [
  {
    id: 'O(1)',
    name: 'Constant',
    label: 'O(1)',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.8)',
    description: 'Execution time remains flat regardless of dataset size.',
    examples: 'Array index lookup, Hash map get, Push/Pop stack',
    calc: () => 1,
  },
  {
    id: 'O(log n)',
    name: 'Logarithmic',
    label: 'O(log n)',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.8)',
    description: 'Search space is halved in each step. Highly scalable for billions of items.',
    examples: 'Binary Search, AVL Tree lookup, B-Tree indexing',
    calc: (n) => Math.max(1, Math.round(Math.log2(Math.max(1, n)) * 10) / 10),
  },
  {
    id: 'O(n)',
    name: 'Linear',
    label: 'O(n)',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.8)',
    description: 'Execution time grows proportionally with the input size.',
    examples: 'Linear Search, Counting Sort, Array traversal',
    calc: (n) => n,
  },
  {
    id: 'O(n log n)',
    name: 'Linearithmic',
    label: 'O(n log n)',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.8)',
    description: 'Gold standard for general-purpose comparison-based sorting.',
    examples: 'MergeSort, QuickSort (Avg), HeapSort',
    calc: (n) => Math.round(n * Math.log2(Math.max(1, n))),
  },
  {
    id: 'O(n^2)',
    name: 'Quadratic',
    label: 'O(n²)',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.8)',
    description: 'Operations grow with the square of input size. Impractical for massive datasets.',
    examples: 'BubbleSort, InsertionSort (Worst), SelectionSort',
    calc: (n) => Math.pow(n, 2),
  },
  {
    id: 'O(2^n)',
    name: 'Exponential',
    label: 'O(2ⁿ)',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.8)',
    description: 'Operations double with every added element. Rapidly explodes.',
    examples: 'Recursive Fibonacci, Power Set generation, Traveling Salesperson (Brute)',
    calc: (n) => Math.pow(2, Math.min(n, 30)),
  },
];

export function BigOGraph({ highlightedComplexity }: Props) {
  const [nValue, setNValue] = useState<number>(16);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [scaleMode, setScaleMode] = useState<'linear' | 'log'>('linear');
  const [hoveredN, setHoveredN] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG Coordinate Constants (Optimized for sharp rendering across all viewports)
  const width = 680;
  const height = 290;
  const paddingLeft = 56;
  const paddingBottom = 38;
  const paddingTop = 22;
  const paddingRight = 30;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Max X and Y bounds for graph rendering
  const maxX = 64;
  const maxYLinear = 2500;
  const maxYLog = 6; // 6 decades (10^0 = 1 to 10^6 = 1,000,000)

  const activeN = hoveredN !== null ? hoveredN : nValue;

  // Map value to SVG Y based on current scale mode
  const mapYtoSvg = (val: number): number => {
    if (scaleMode === 'linear') {
      const clampedY = Math.max(0, val);
      return paddingTop + graphHeight - (clampedY / maxYLinear) * graphHeight;
    } else {
      // Logarithmic scaling: log10(1) = 0 to log10(1000000) = 6
      const logVal = Math.log10(Math.max(1, val));
      const normalized = Math.min(1.2, Math.max(0, logVal / maxYLog));
      return paddingTop + graphHeight - normalized * graphHeight;
    }
  };

  // Generate SVG Path for a given complexity class with proper boundary exit (no flatlining)
  const generateCurvePath = (calc: (n: number) => number) => {
    const points: [number, number][] = [];
    const samples = 90;

    for (let i = 1; i <= samples; i++) {
      const xVal = (i / samples) * maxX;
      const yVal = calc(xVal);

      const svgX = paddingLeft + (xVal / maxX) * graphWidth;
      const svgY = mapYtoSvg(yVal);
      points.push([svgX, svgY]);
    }

    return points.reduce((acc, [x, y], idx) => {
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  };

  // Determine which class is active
  const activeClass = useMemo(() => {
    if (selectedClassId) {
      return COMPLEXITY_CLASSES.find((c) => c.id === selectedClassId) || null;
    }
    if (highlightedComplexity) {
      return (
        COMPLEXITY_CLASSES.find(
          (c) =>
            highlightedComplexity.toLowerCase().includes(c.id.toLowerCase()) ||
            highlightedComplexity.toLowerCase().includes(c.label.toLowerCase())
        ) || null
      );
    }
    return null;
  }, [selectedClassId, highlightedComplexity]);

  // Handle interactive SVG scrubbing
  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    if (svgX >= paddingLeft && svgX <= width - paddingRight) {
      const ratio = (svgX - paddingLeft) / graphWidth;
      const calculatedN = Math.max(1, Math.min(maxX, Math.round(ratio * maxX)));
      setHoveredN(calculatedN);
    }
  };

  const handleSvgPointerLeave = () => {
    setHoveredN(null);
  };

  const handleSvgClick = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    if (svgX >= paddingLeft && svgX <= width - paddingRight) {
      const ratio = (svgX - paddingLeft) / graphWidth;
      const calculatedN = Math.max(1, Math.min(maxX, Math.round(ratio * maxX)));
      setNValue(calculatedN);
    }
  };

  const formatOps = (ops: number): string => {
    if (ops >= 1000000) return `${(ops / 1000000).toFixed(1)}M`;
    if (ops >= 1000) return `${(ops / 1000).toFixed(1)}k`;
    return String(ops);
  };

  const markerX = paddingLeft + (activeN / maxX) * graphWidth;

  return (
    <div className="big-o-graph-card">
      {/* Header with Title and Interactive Controls */}
      <div className="big-o-header">
        <div className="big-o-title-group">
          <div className="big-o-icon-ring">
            <TrendingUp size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="big-o-title">Asymptotic Complexity Growth Curves</h3>
            <p className="big-o-subtitle">
              Visualizing mathematical operation growth curves (N = 1 to 64) across algorithmic complexity classes.
            </p>
          </div>
        </div>

        {/* Dataset Size Controls & Scale Mode Switcher */}
        <div className="big-o-controls-cluster">
          {/* Scale Toggle: Linear vs Logarithmic */}
          <div className="scale-toggle-group">
            <button
              type="button"
              className={`scale-btn ${scaleMode === 'linear' ? 'active-scale' : ''}`}
              onClick={() => setScaleMode('linear')}
              title="Linear Scale (Direct visual comparison of exponential explosion)"
            >
              Linear
            </button>
            <button
              type="button"
              className={`scale-btn ${scaleMode === 'log' ? 'active-scale' : ''}`}
              onClick={() => setScaleMode('log')}
              title="Logarithmic Scale (All curves clearly visible across all decades)"
            >
              Log₁₀
            </button>
          </div>

          {/* Dynamic N Slider */}
          <div className="n-slider-box">
            <div className="n-slider-header">
              <Sliders size={13} className="text-slate-400" />
              <span className="n-label">Dataset Size:</span>
              <span className="n-val">N = {activeN}</span>
            </div>
            <input
              type="range"
              min={1}
              max={64}
              value={activeN}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNValue(val);
                setHoveredN(null);
              }}
              className="n-range-slider"
              aria-label="Adjust dataset size N"
            />
            <div className="n-quick-presets">
              {[8, 16, 32, 64].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`n-preset-btn ${nValue === preset ? 'active-preset' : ''}`}
                  onClick={() => {
                    setNValue(preset);
                    setHoveredN(null);
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Growth Chart with Responsive ViewBox & ClipPath */}
      <div className="big-o-svg-wrapper">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="big-o-svg"
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={handleSvgPointerMove}
          onPointerLeave={handleSvgPointerLeave}
          onClick={handleSvgClick}
        >
          <defs>
            {/* Strict plot clip boundary to ensure curves exit smoothly without breaking graph borders */}
            <clipPath id="chart-plot-clip">
              <rect
                x={paddingLeft}
                y={paddingTop}
                width={graphWidth}
                height={graphHeight}
              />
            </clipPath>
          </defs>

          {/* Plot Background Accent */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={graphWidth}
            height={graphHeight}
            fill="rgba(255, 255, 255, 0.01)"
          />

          {/* Coordinate Axes */}
          <line
            x1={paddingLeft}
            y1={paddingTop + graphHeight}
            x2={width - paddingRight}
            y2={paddingTop + graphHeight}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + graphHeight}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
          />

          {/* Horizontal Grid Guide Lines */}
          {[0.25, 0.5, 0.75].map((fraction) => {
            const y = paddingTop + graphHeight * (1 - fraction);
            const labelVal = scaleMode === 'linear'
              ? `${Math.round(maxYLinear * fraction)}`
              : `10^${(maxYLog * fraction).toFixed(0)}`;

            return (
              <g key={fraction}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid Guide Lines */}
          {[0.25, 0.5, 0.75, 1].map((fraction) => {
            const x = paddingLeft + graphWidth * fraction;
            const labelN = Math.round(maxX * fraction);
            return (
              <g key={fraction}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + graphHeight}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={x}
                  y={paddingTop + graphHeight + 14}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  {labelN}
                </text>
              </g>
            );
          })}

          {/* Render Complexity Curves (Clipped smoothly to graph bounds) */}
          <g clipPath="url(#chart-plot-clip)">
            {COMPLEXITY_CLASSES.map((cls) => {
              const pathData = generateCurvePath(cls.calc);
              const isHighlighted = activeClass?.id === cls.id;
              const isDimmed = activeClass !== null && !isHighlighted;

              return (
                <g key={cls.id} className="curve-group">
                  {/* Glow Aura for Highlighted Curve */}
                  {isHighlighted && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke={cls.color}
                      strokeWidth="8"
                      opacity="0.35"
                      strokeLinecap="round"
                    />
                  )}

                  <path
                    d={pathData}
                    fill="none"
                    stroke={cls.color}
                    strokeWidth={isHighlighted ? 3.5 : 2}
                    opacity={isDimmed ? 0.2 : 0.95}
                    strokeLinecap="round"
                    className="curve-path"
                    style={{ transition: 'opacity 0.2s ease, stroke-width 0.2s ease' }}
                  />
                </g>
              );
            })}
          </g>

          {/* Interactive Crosshair & Cursor Line */}
          <g className="n-marker-group">
            <line
              x1={markerX}
              y1={paddingTop}
              x2={markerX}
              y2={paddingTop + graphHeight}
              stroke="#38bdf8"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              opacity="0.75"
            />

            {/* Glowing Points on Every Curve at Active N */}
            {COMPLEXITY_CLASSES.map((cls) => {
              const ops = cls.calc(activeN);
              const pointY = mapYtoSvg(ops);
              const isHighlighted = activeClass?.id === cls.id;
              const isDimmed = activeClass !== null && !isHighlighted;

              // Only render point if within graph bounds
              if (pointY < paddingTop - 4 || pointY > paddingTop + graphHeight + 4) return null;

              return (
                <circle
                  key={cls.id}
                  cx={markerX}
                  cy={pointY}
                  r={isHighlighted ? 5.5 : 3.5}
                  fill={cls.color}
                  stroke="#ffffff"
                  strokeWidth={isHighlighted ? 2 : 1}
                  opacity={isDimmed ? 0.25 : 1}
                  className="curve-node-dot"
                />
              );
            })}

            {/* Bottom N Pill Indicator */}
            <circle cx={markerX} cy={paddingTop + graphHeight} r="4" fill="#38bdf8" />
          </g>

          {/* Axis Labels */}
          <text
            x={paddingLeft - 8}
            y={paddingTop - 6}
            fill="#64748b"
            fontSize="10"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            textAnchor="start"
          >
            {scaleMode === 'linear' ? 'Operations (Ops)' : 'Log₁₀ Ops'}
          </text>
          <text
            x={width - paddingRight}
            y={paddingTop + graphHeight + 28}
            fill="#64748b"
            fontSize="10"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            textAnchor="end"
          >
            Input Size (N) →
          </text>
        </svg>
      </div>

      {/* Complexity Class Legend & Live Counter Pills */}
      <div className="big-o-pills-row" role="tablist" aria-label="Algorithmic complexity classes">
        {COMPLEXITY_CLASSES.map((cls) => {
          const ops = cls.calc(activeN);
          const formattedOps = formatOps(ops);
          const isSelected = activeClass?.id === cls.id;

          return (
            <button
              key={cls.id}
              type="button"
              className={`big-o-pill-btn ${isSelected ? 'active-pill' : ''}`}
              style={{
                borderColor: isSelected ? cls.color : 'rgba(255, 255, 255, 0.08)',
                background: isSelected ? `${cls.color}18` : 'rgba(255, 255, 255, 0.02)',
              }}
              onClick={() => setSelectedClassId(selectedClassId === cls.id ? null : cls.id)}
              role="tab"
              aria-selected={isSelected}
              title={`Click to inspect ${cls.label} (${cls.name})`}
            >
              <span className="pill-dot" style={{ background: cls.color }} />
              <span className="pill-name">{cls.label}</span>
              <span className="pill-ops" style={{ color: cls.color }}>
                {formattedOps} ops
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Complexity Detail Card */}
      {activeClass && (
        <div className="big-o-detail-banner" style={{ borderLeftColor: activeClass.color }}>
          <div className="detail-header">
            <Sparkles size={14} style={{ color: activeClass.color }} />
            <span className="detail-title" style={{ color: activeClass.color }}>
              {activeClass.label} ({activeClass.name})
            </span>
            <span className="detail-ops">
              ≈ {activeClass.calc(activeN).toLocaleString()} operations at N = {activeN}
            </span>
          </div>
          <p className="detail-desc">{activeClass.description}</p>
          <div className="detail-examples">
            <Info size={12} className="text-slate-400" />
            <span>Common in: <strong>{activeClass.examples}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
