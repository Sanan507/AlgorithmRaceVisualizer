import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface Step {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot?: number;
}

export function HeroMiniCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lane1Algo] = useState('Quick Sort');
  const [lane2Algo] = useState('Bubble Sort');
  const [lane1Stats, setLane1Stats] = useState({ comparisons: 0, swaps: 0, status: 'Racing...' });
  const [lane2Stats, setLane2Stats] = useState({ comparisons: 0, swaps: 0, status: 'Racing...' });

  const stateRef = useRef<{
    lane1Steps: Step[];
    lane2Steps: Step[];
    lane1Idx: number;
    lane2Idx: number;
    arraySize: number;
    initialArray: number[];
    timer: number | null;
  }>({
    lane1Steps: [],
    lane2Steps: [],
    lane1Idx: 0,
    lane2Idx: 0,
    arraySize: 20,
    initialArray: [],
    timer: null,
  });

  // Mobile / Reduced Motion detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsMobileDevice(isMobile);
      if (isMobile) {
        setIsPlaying(false); // Disable auto-play loop on mobile devices to save main thread budget
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // IntersectionObserver to pause rendering when scrolled offscreen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Tab Visibility API to pause rendering when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const generateSteps = (arr: number[]) => {
    // QuickSort Step Generator
    const qSteps: Step[] = [];
    const qArr = [...arr];
    let qComp = 0;
    let qSwap = 0;

    const quickSortHelper = (low: number, high: number) => {
      if (low < high) {
        const pivotVal = qArr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          qComp++;
          qSteps.push({
            array: [...qArr],
            comparing: [j, high],
            swapping: [],
            sorted: getSortedIndices(low, high, qArr),
            pivot: high,
          });
          if (qArr[j] < pivotVal) {
            i++;
            if (i !== j) {
              qSwap++;
              const temp = qArr[i];
              qArr[i] = qArr[j];
              qArr[j] = temp;
              qSteps.push({
                array: [...qArr],
                comparing: [],
                swapping: [i, j],
                sorted: getSortedIndices(low, high, qArr),
                pivot: high,
              });
            }
          }
        }
        qSwap++;
        const temp = qArr[i + 1];
        qArr[i + 1] = qArr[high];
        qArr[high] = temp;
        const pIndex = i + 1;
        qSteps.push({
          array: [...qArr],
          comparing: [],
          swapping: [i + 1, high],
          sorted: getSortedIndices(low, high, qArr),
          pivot: pIndex,
        });

        quickSortHelper(low, pIndex - 1);
        quickSortHelper(pIndex + 1, high);
      }
    };

    const getSortedIndices = (currentLow: number, currentHigh: number, currentArr: number[]) => {
      const sorted: number[] = [];
      for (let k = 0; k < currentArr.length; k++) {
        if (k < currentLow || k > currentHigh) sorted.push(k);
      }
      return sorted;
    };

    quickSortHelper(0, qArr.length - 1);
    qSteps.push({
      array: [...qArr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: qArr.length }, (_, k) => k),
    });

    // BubbleSort Step Generator
    const bSteps: Step[] = [];
    const bArr = [...arr];
    const n = bArr.length;
    let bComp = 0;
    let bSwap = 0;
    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        bComp++;
        bSteps.push({
          array: [...bArr],
          comparing: [j, j + 1],
          swapping: [],
          sorted: [...sortedIndices],
        });
        if (bArr[j] > bArr[j + 1]) {
          bSwap++;
          const temp = bArr[j];
          bArr[j] = bArr[j + 1];
          bArr[j + 1] = temp;
          bSteps.push({
            array: [...bArr],
            comparing: [],
            swapping: [j, j + 1],
            sorted: [...sortedIndices],
          });
        }
      }
      sortedIndices.push(n - 1 - i);
    }
    sortedIndices.push(0);
    bSteps.push({
      array: [...bArr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k),
    });

    return { qSteps, bSteps, qComp, qSwap, bComp, bSwap };
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background fill
    ctx.fillStyle = '#090b10';
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const laneHeight = (height - 30) / 2;

    // Draw Lane 1 (QuickSort)
    drawLane(
      ctx,
      0,
      15,
      width,
      laneHeight,
      lane1Algo,
      stateRef.current.lane1Steps[stateRef.current.lane1Idx],
      '#a855f7'
    );

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, laneHeight + 15);
    ctx.lineTo(width - 15, laneHeight + 15);
    ctx.stroke();

    // Draw Lane 2 (BubbleSort)
    drawLane(
      ctx,
      0,
      laneHeight + 25,
      width,
      laneHeight,
      lane2Algo,
      stateRef.current.lane2Steps[stateRef.current.lane2Idx],
      '#3b82f6'
    );
  }, [lane1Algo, lane2Algo]);

  const resetRace = useCallback(() => {
    const size = 22;
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 15);
    const { qSteps, bSteps } = generateSteps(arr);

    stateRef.current.initialArray = arr;
    stateRef.current.lane1Steps = qSteps;
    stateRef.current.lane2Steps = bSteps;
    stateRef.current.lane1Idx = 0;
    stateRef.current.lane2Idx = 0;

    setLane1Stats({ comparisons: 0, swaps: 0, status: 'Racing...' });
    setLane2Stats({ comparisons: 0, swaps: 0, status: 'Racing...' });
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    resetRace();
  }, [resetRace]);

  // Main animation timer effect - paused on mobile or when offscreen/hidden
  useEffect(() => {
    if (!isPlaying || !isVisible || isMobileDevice) {
      if (stateRef.current.timer) clearInterval(stateRef.current.timer);
      return;
    }

    stateRef.current.timer = window.setInterval(() => {
      let l1Finished = false;
      let l2Finished = false;

      if (stateRef.current.lane1Idx < stateRef.current.lane1Steps.length - 1) {
        stateRef.current.lane1Idx++;
      } else {
        l1Finished = true;
      }

      if (stateRef.current.lane2Idx < stateRef.current.lane2Steps.length - 1) {
        stateRef.current.lane2Idx++;
      } else {
        l2Finished = true;
      }

      renderCanvas();

      setLane1Stats({
        comparisons: Math.floor(stateRef.current.lane1Idx * 0.8),
        swaps: Math.floor(stateRef.current.lane1Idx * 0.4),
        status: l1Finished ? 'Winner 🏆' : 'Racing...',
      });

      setLane2Stats({
        comparisons: Math.floor(stateRef.current.lane2Idx * 0.9),
        swaps: Math.floor(stateRef.current.lane2Idx * 0.5),
        status: l2Finished ? 'Completed' : 'Racing...',
      });

      if (l1Finished && l2Finished) {
        setTimeout(() => {
          resetRace();
        }, 3000);
      }
    }, 45);

    return () => {
      if (stateRef.current.timer) clearInterval(stateRef.current.timer);
    };
  }, [isPlaying, isVisible, isMobileDevice, renderCanvas, resetRace]);

  const drawLane = (
    ctx: CanvasRenderingContext2D,
    _xOffset: number,
    yOffset: number,
    width: number,
    height: number,
    _title: string,
    step: Step | undefined,
    primaryGlow: string
  ) => {
    if (!step) return;

    const padding = 20;
    const availableWidth = width - padding * 2;
    const n = step.array.length;
    const barGap = 4;
    const barWidth = Math.max(3, (availableWidth - (n - 1) * barGap) / n);

    const maxVal = 100;

    step.array.forEach((val, i) => {
      const barHeight = (val / maxVal) * (height - 25);
      const x = padding + i * (barWidth + barGap);
      const y = yOffset + height - barHeight;

      let fillStyle = '#334155';
      let shadowColor = 'transparent';
      let shadowBlur = 0;

      if (step.sorted.includes(i)) {
        fillStyle = '#10b981';
        shadowColor = 'rgba(16, 185, 129, 0.5)';
        shadowBlur = 8;
      } else if (step.swapping.includes(i)) {
        fillStyle = '#ec4899';
        shadowColor = 'rgba(236, 72, 153, 0.8)';
        shadowBlur = 12;
      } else if (step.comparing.includes(i)) {
        fillStyle = '#f59e0b';
        shadowColor = 'rgba(245, 158, 11, 0.7)';
        shadowBlur = 10;
      } else if (step.pivot === i) {
        fillStyle = '#c084fc';
        shadowColor = 'rgba(192, 132, 252, 0.8)';
        shadowBlur = 12;
      } else {
        fillStyle = primaryGlow;
      }

      ctx.save();
      ctx.fillStyle = fillStyle;
      if (shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
      }

      const radius = 3;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
      ctx.fill();
      ctx.restore();
    });
  };

  return (
    <div className="hero-mini-canvas-container" ref={containerRef}>
      <div className="hero-canvas-header">
        <div className="hero-canvas-title-group">
          <div className="live-pulse-dot" />
          <span className="hero-canvas-badge">LIVE HARDWARE ACCELERATED SIMULATOR</span>
        </div>
        <div className="hero-canvas-actions">
          <button
            className="hero-canvas-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Simulator' : 'Play Simulator'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            className="hero-canvas-btn"
            onClick={resetRace}
            title="Generate New Dataset"
          >
            <RotateCcw size={14} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      <div className="hero-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={580}
          height={260}
          className="hero-canvas-element"
        />
      </div>

      <div className="hero-canvas-footer-stats">
        <div className="lane-stat-pill lane-1-pill">
          <Zap size={13} className="pill-icon text-purple-400" />
          <span className="pill-title">{lane1Algo}:</span>
          <span className="pill-val">{lane1Stats.comparisons} comps</span>
          <span className={`pill-badge ${lane1Stats.status.includes('Winner') ? 'badge-winner' : ''}`}>
            {lane1Stats.status}
          </span>
        </div>

        <div className="lane-stat-pill lane-2-pill">
          <Zap size={13} className="pill-icon text-blue-400" />
          <span className="pill-title">{lane2Algo}:</span>
          <span className="pill-val">{lane2Stats.comparisons} comps</span>
          <span className="pill-badge">{lane2Stats.status}</span>
        </div>
      </div>
    </div>
  );
}
