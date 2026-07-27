export interface SnapshotLaneData {
  name: string;
  complexity?: string;
  timeMs: number;
  opLabel: string;
  opValue: number;
  secLabel: string;
  secValue: number;
  done: boolean;
  nodesVisited?: number;
  frontierSize?: number;
  pathLength?: number;
}

export interface SnapshotExportOptions {
  type: 'sorting' | 'searching' | 'pathfinding';
  datasetType?: string;
  datasetSize?: number;
  isCompleted?: boolean;
  winner?: string | null;
  efficiencyText?: string;
  winnerExplanation?: string;
  laneData: SnapshotLaneData[];
}

export function exportComparisonSnapshot(options: SnapshotExportOptions) {
  const { 
    type, 
    datasetType, 
    datasetSize, 
    isCompleted = false, 
    winner, 
    efficiencyText, 
    winnerExplanation,
    laneData 
  } = options;

  // Find all active lane canvases from DOM
  const laneCanvasElements = Array.from(
    document.querySelectorAll<HTMLCanvasElement>('.lane-canvas-container canvas')
  );

  // Layout parameters (Virtual resolution = 1400px wide)
  const baseWidth = 1400;
  const padding = 36;
  const headerHeight = 90;
  
  // Left Column (Cards): 914px wide, Right Column (Leaderboard & Winner): 390px wide
  const gapBetweenCols = 24;
  const rightColWidth = 390;
  const leftColWidth = baseWidth - (padding * 2) - rightColWidth - gapBetweenCols; // 914px

  // Grid for lane cards in Left Column (2 columns of cards)
  const laneCols = Math.min(2, Math.max(1, laneData.length));
  const laneRows = Math.ceil(laneData.length / laneCols);
  const cardGap = 20;
  const cardWidth = (leftColWidth - ((laneCols - 1) * cardGap)) / laneCols;
  const cardCanvasHeight = 180;
  const cardHeaderHeight = 44;
  const cardStatsGridHeight = 110; // Holds the 4 cool live stats progress bars!
  const cardHeight = cardHeaderHeight + cardCanvasHeight + cardStatsGridHeight;

  const leftSectionHeight = (laneRows * cardHeight) + ((laneRows - 1) * cardGap);
  const footerHeight = 40;

  const totalHeight = padding + headerHeight + leftSectionHeight + footerHeight + padding;

  // Create offscreen canvas with 2x scale for Retina sharpness
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * scale;
  canvas.height = totalHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Helper for drawing rounded pill boxes
  function drawPill(x: number, y: number, w: number, h: number, r: number, bg: string, stroke?: string) {
    ctx!.save();
    ctx!.fillStyle = bg;
    ctx!.beginPath();
    ctx!.roundRect(x, y, w, h, r);
    ctx!.fill();
    if (stroke) {
      ctx!.strokeStyle = stroke;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }
    ctx!.restore();
  }

  // 1. Deep Executive Slate Backdrop
  const bgGradient = ctx.createLinearGradient(0, 0, baseWidth, totalHeight);
  bgGradient.addColorStop(0, '#030712');
  bgGradient.addColorStop(0.5, '#090e1a');
  bgGradient.addColorStop(1, '#02040a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, baseWidth, totalHeight);

  // 2. Procedural Luxury Topography Pattern (Subtle Organic Contour Lines)
  ctx.save();
  const topoCurves = [
    { startY: 80, cp1x: 350, cp1y: 30, cp2x: 800, cp2y: 160, endY: 100 },
    { startY: 160, cp1x: 400, cp1y: 90, cp2x: 850, cp2y: 240, endY: 180 },
    { startY: 260, cp1x: 450, cp1y: 180, cp2x: 900, cp2y: 340, endY: 280 },
    { startY: 380, cp1x: 300, cp1y: 300, cp2x: 950, cp2y: 460, endY: 400 },
    { startY: 500, cp1x: 500, cp1y: 420, cp2x: 1000, cp2y: 580, endY: 520 },
    { startY: 620, cp1x: 350, cp1y: 540, cp2x: 1050, cp2y: 700, endY: 640 },
  ];

  topoCurves.forEach((c, idx) => {
    const alpha = idx % 2 === 0 ? '0.04' : '0.025';
    const strokeGrad = ctx.createLinearGradient(0, c.startY, baseWidth, c.endY);
    strokeGrad.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
    strokeGrad.addColorStop(0.5, `rgba(99, 102, 241, ${alpha})`);
    strokeGrad.addColorStop(1, `rgba(168, 85, 247, ${alpha})`);
    
    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 1.2;

    for (let offset = -24; offset <= 24; offset += 12) {
      ctx.beginPath();
      ctx.moveTo(0, c.startY + offset);
      ctx.bezierCurveTo(c.cp1x, c.cp1y + offset, c.cp2x, c.cp2y + offset, baseWidth, c.endY + offset);
      ctx.stroke();
    }
  });
  ctx.restore();

  // Ambient Radial Glow Orbs
  const orb1 = ctx.createRadialGradient(250, 120, 10, 250, 120, 500);
  orb1.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
  orb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, baseWidth, totalHeight);

  const orb2 = ctx.createRadialGradient(baseWidth - 250, totalHeight - 150, 10, baseWidth - 250, totalHeight - 150, 550);
  orb2.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
  orb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, baseWidth, totalHeight);

  // Top Neon Line with Glow
  ctx.save();
  ctx.shadowColor = '#6366f1';
  ctx.shadowBlur = 14;
  const topBarGrad = ctx.createLinearGradient(0, 0, baseWidth, 0);
  topBarGrad.addColorStop(0, '#38bdf8');
  topBarGrad.addColorStop(0.35, '#818cf8');
  topBarGrad.addColorStop(0.7, '#c084fc');
  topBarGrad.addColorStop(1, '#f43f5e');
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(0, 0, baseWidth, 4);
  ctx.restore();

  let currentY = padding;

  // 3. Header Section
  ctx.save();
  ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('⚡ ALGORACE VISUALIZER', padding, currentY + 28);
  ctx.restore();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`EXECUTIVE BENCHMARK REPORT  •  ${type.toUpperCase()} ARENA`, padding, currentY + 52);

  // Metadata Pill Box (Top Right)
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const metaStr = `Mode: ${datasetType || 'Standard'}  |  Size: ${datasetSize ?? 'N/A'}  |  ${dateStr}`;
  ctx.font = '600 12px monospace';
  const metaMetrics = ctx.measureText(metaStr);
  const metaW = metaMetrics.width + 28;
  const metaH = 34;
  const metaX = baseWidth - padding - metaW;

  drawPill(metaX, currentY + 14, metaW, metaH, 8, 'rgba(15, 23, 42, 0.85)', 'rgba(56, 189, 248, 0.35)');
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(metaStr, metaX + 14, currentY + 35);

  currentY += headerHeight;

  // Maximum metrics for precise relative bar scaling
  const maxNodesVisited = Math.max(1, ...laneData.map(l => l.nodesVisited || 1));
  const maxFrontierSize = Math.max(1, ...laneData.map(l => l.frontierSize || 1));
  const maxPathLength = Math.max(1, ...laneData.map(l => l.pathLength || 1));
  const maxTime = Math.max(1, ...laneData.map(l => l.timeMs || 1));
  const maxOps = Math.max(1, ...laneData.map(l => l.opValue || 1));
  const maxSec = Math.max(1, ...laneData.map(l => l.secValue || 1));
  const maxTotalOps = Math.max(1, ...laneData.map(l => (l.opValue || 0) + (l.secValue || 0)));

  // 4. LEFT COLUMN: Algorithm Cards Grid
  const leftColX = padding;
  laneData.forEach((lane, index) => {
    const row = Math.floor(index / laneCols);
    const col = index % laneCols;

    const x = leftColX + col * (cardWidth + cardGap);
    const y = currentY + row * (cardHeight + cardGap);

    const isWinnerCard = isCompleted && winner === lane.name;

    // Card background panel
    ctx.save();
    if (isWinnerCard) {
      ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
      ctx.shadowBlur = 14;
    }
    drawPill(
      x, y, cardWidth, cardHeight, 14, 
      '#0f172a', 
      isWinnerCard ? 'rgba(245, 158, 11, 0.7)' : 'rgba(255, 255, 255, 0.1)'
    );
    ctx.restore();

    // Card Header
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(lane.name, x + 14, y + 27);

    // Header Time indicator (top right of card header)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 12px monospace';
    const headerTimeText = `⏱️ ${lane.timeMs} ms`;
    const headerTimeW = ctx.measureText(headerTimeText).width;
    ctx.fillText(headerTimeText, x + cardWidth - headerTimeW - 14, y + 27);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + cardHeaderHeight);
    ctx.lineTo(x + cardWidth, y + cardHeaderHeight);
    ctx.stroke();

    // Recessed Frame for Canvas Visualizer
    const frameX = x + 8;
    const frameY = y + cardHeaderHeight + 6;
    const frameW = cardWidth - 16;
    const frameH = cardCanvasHeight - 12;

    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameW, frameH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.stroke();

    // Draw Canvas image from DOM
    const domCanvas = laneCanvasElements[index];
    if (domCanvas) {
      ctx.drawImage(domCanvas, frameX + 4, frameY + 4, frameW - 8, frameH - 8);
    }

    // Card Stats Grid Footer (Holds 4 Meaningful Live Metrics Progress Bars!)
    const statsY = y + cardHeaderHeight + cardCanvasHeight;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.beginPath();
    ctx.moveTo(x, statsY);
    ctx.lineTo(x + cardWidth, statsY);
    ctx.stroke();

    // Determine 4 precise, meaningful metrics based on arena type
    let metricBars: Array<{ label: string; valStr: string; ratio: number; grad: [string, string] }> = [];

    if (type === 'pathfinding') {
      metricBars = [
        {
          label: 'NODES VISITED',
          valStr: String(lane.nodesVisited ?? 0),
          ratio: (lane.nodesVisited ?? 0) / maxNodesVisited,
          grad: ['#0ea5e9', '#38bdf8'] // Cyan
        },
        {
          label: 'FRONTIER SIZE',
          valStr: String(lane.frontierSize ?? 0),
          ratio: (lane.frontierSize ?? 0) / maxFrontierSize,
          grad: ['#a855f7', '#c084fc'] // Purple
        },
        {
          label: 'PATH LENGTH',
          valStr: lane.pathLength ? String(lane.pathLength) : (lane.done ? 'No Path' : '0'),
          ratio: (lane.pathLength ?? 0) / maxPathLength,
          grad: ['#f59e0b', '#fbbf24'] // Amber
        },
        {
          label: 'EXECUTION TIME',
          valStr: `${lane.timeMs} ms`,
          ratio: lane.timeMs / maxTime,
          grad: ['#ec4899', '#f472b6'] // Pink
        }
      ];
    } else if (type === 'sorting') {
      const totalOps = (lane.opValue || 0) + (lane.secValue || 0);
      metricBars = [
        {
          label: 'COMPARISONS',
          valStr: lane.opValue.toLocaleString(),
          ratio: lane.opValue / maxOps,
          grad: ['#0ea5e9', '#38bdf8'] // Cyan
        },
        {
          label: 'ARRAY SWAPS',
          valStr: lane.secValue.toLocaleString(),
          ratio: maxSec > 0 ? lane.secValue / maxSec : 0,
          grad: ['#a855f7', '#c084fc'] // Purple
        },
        {
          label: 'TOTAL OPERATIONS',
          valStr: totalOps.toLocaleString(),
          ratio: maxTotalOps > 0 ? totalOps / maxTotalOps : 0,
          grad: ['#f59e0b', '#fbbf24'] // Amber
        },
        {
          label: 'EXECUTION TIME',
          valStr: `${lane.timeMs} ms`,
          ratio: lane.timeMs / maxTime,
          grad: ['#ec4899', '#f472b6'] // Pink
        }
      ];
    } else { // searching
      const currentSize = Math.max(1, datasetSize || 50);
      const scanPercent = Math.min(100, Math.round((lane.opValue / currentSize) * 100));
      const isFound = lane.secValue === 1;

      metricBars = [
        {
          label: 'COMPARISONS',
          valStr: lane.opValue.toLocaleString(),
          ratio: lane.opValue / maxOps,
          grad: ['#0ea5e9', '#38bdf8'] // Cyan
        },
        {
          label: 'TARGET RESULT',
          valStr: isFound ? 'Target Found' : (lane.done ? 'Not Found' : 'Searching'),
          ratio: isFound ? 1.0 : (lane.done ? 0.3 : 0.1),
          grad: isFound ? ['#10b981', '#34d399'] : ['#f43f5e', '#fb7185'] // Emerald or Rose
        },
        {
          label: 'SEARCH SCANNED',
          valStr: `${scanPercent}% space`,
          ratio: Math.min(1, lane.opValue / currentSize),
          grad: ['#f59e0b', '#fbbf24'] // Amber
        },
        {
          label: 'EXECUTION TIME',
          valStr: `${lane.timeMs} ms`,
          ratio: lane.timeMs / maxTime,
          grad: ['#ec4899', '#f472b6'] // Pink
        }
      ];
    }

    // Render 2x2 grid of metric progress bars inside card footer!
    const subColWidth = (cardWidth - 28) / 2;
    metricBars.forEach((m, mIdx) => {
      const mRow = Math.floor(mIdx / 2);
      const mCol = mIdx % 2;

      const barX = x + 10 + (mCol * (subColWidth + 8));
      const barY = statsY + 8 + (mRow * 48);

      // Label Text & Value
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.label, barX, barY + 10);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px monospace';
      const valW = ctx.measureText(m.valStr).width;
      ctx.fillText(m.valStr, barX + subColWidth - valW, barY + 10);

      // Bar Track
      const trackY = barY + 16;
      const trackH = 12;
      drawPill(barX, trackY, subColWidth, trackH, 4, '#1e293b');

      // Filled Bar
      const fillW = Math.max(m.ratio > 0 ? 6 : 0, subColWidth * Math.min(1, Math.max(0, m.ratio)));
      if (fillW > 0) {
        const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        barGrad.addColorStop(0, m.grad[0]);
        barGrad.addColorStop(1, m.grad[1]);
        drawPill(barX, trackY, fillW, trackH, 4, barGrad as any);
      }
    });
  });

  // 5. RIGHT COLUMN: Leaderboard Ranking & Winner Declared Panels
  const rightColX = baseWidth - padding - rightColWidth;
  let rightY = currentY;

  // 5A. LEADERBOARD RANKING Panel
  const leaderboardH = 250;
  drawPill(rightColX, rightY, rightColWidth, leaderboardH, 14, 'rgba(15, 23, 42, 0.85)', 'rgba(255, 255, 255, 0.1)');

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('LEADERBOARD RANKING', rightColX + 16, rightY + 28);

  // Sort lanes for ranking
  const rankedLanes = [...laneData].sort((a, b) => {
    if (a.done && !b.done) return -1;
    if (!a.done && b.done) return 1;
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
    return a.opValue - b.opValue;
  });

  const rankBadgeColors = [
    { bg: '#f59e0b', text: '#000000' }, // Gold #1
    { bg: '#94a3b8', text: '#000000' }, // Silver #2
    { bg: '#d97706', text: '#ffffff' }, // Bronze #3
    { bg: '#334155', text: '#cbd5e1' }, // 4th
  ];

  let itemY = rightY + 42;
  rankedLanes.forEach((lane, rankIdx) => {
    const isWinner = isCompleted && rankIdx === 0 && winner === lane.name;
    const badgeColor = rankBadgeColors[Math.min(rankIdx, 3)];

    // Rank row container
    drawPill(
      rightColX + 12, itemY, rightColWidth - 24, 42, 10, 
      isWinner ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)', 
      isWinner ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.06)'
    );

    // Rank badge pill
    drawPill(rightColX + 22, itemY + 9, 24, 24, 6, badgeColor.bg);
    ctx.fillStyle = badgeColor.text;
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(rankIdx + 1), rightColX + 30, itemY + 25);

    // Algorithm Name & Status
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(lane.name, rightColX + 56, itemY + 21);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(lane.done ? 'Finished' : (lane.timeMs > 0 ? 'Running' : 'Ready'), rightColX + 56, itemY + 34);

    // Time (ms)
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px monospace';
    const timeStr = `${lane.timeMs} ms`;
    const timeW = ctx.measureText(timeStr).width;
    ctx.fillText(timeStr, rightColX + rightColWidth - 24 - timeW, itemY + 25);

    itemY += 48;
  });

  rightY += leaderboardH + 18;

  // 5B. WINNER DECLARED! Panel (With Insights & Algorithm Explanation!)
  const winnerH = leftSectionHeight - leaderboardH - 18;
  if (isCompleted && winner) {
    ctx.save();
    ctx.shadowColor = 'rgba(16, 185, 129, 0.35)';
    ctx.shadowBlur = 16;
    drawPill(rightColX, rightY, rightColWidth, winnerH, 14, 'rgba(6, 78, 59, 0.4)', 'rgba(16, 185, 129, 0.5)');
    ctx.restore();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('🏆 WINNER DECLARED!', rightColX + 18, rightY + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(winner, rightColX + 18, rightY + 58);

    let textY = rightY + 82;

    // Short ratio text
    if (efficiencyText) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(efficiencyText, rightColX + 18, textY);
      textY += 24;
    }

    // Full Algorithm Explanation / Insights Paragraph
    if (winnerExplanation) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 12px system-ui, -apple-system, sans-serif';
      
      const words = winnerExplanation.split(' ');
      let line = '';
      const maxTextW = rightColWidth - 36;

      words.forEach(word => {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxTextW) {
          ctx.fillText(line, rightColX + 18, textY);
          line = word + ' ';
          textY += 18;
        } else {
          line = testLine;
        }
      });
      if (line) {
        ctx.fillText(line, rightColX + 18, textY);
      }
    }
  } else {
    // READY / IN PROGRESS STATUS BOX
    const isRunning = laneData.some(l => l.timeMs > 0 && !l.done);
    drawPill(rightColX, rightY, rightColWidth, winnerH, 14, 'rgba(99, 102, 241, 0.08)', 'rgba(99, 102, 241, 0.35)');

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(isRunning ? '⏳ SIMULATION RUNNING' : '⚡ BENCHMARK READY', rightColX + 18, rightY + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(isRunning ? 'Calculating Performance...' : 'Awaiting Race Execution', rightColX + 18, rightY + 58);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Click Start in AlgoRace to execute live benchmark.', rightColX + 18, rightY + 82);
  }

  currentY += leftSectionHeight + 20;

  // 6. Footer Branding
  ctx.fillStyle = '#64748b';
  ctx.font = '500 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('⚡ Generated by AlgoRace Visualizer • High-Precision Executive Report System', padding, currentY + 16);

  // Trigger PNG Download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `algorace_${type}_luxury_snapshot_${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
