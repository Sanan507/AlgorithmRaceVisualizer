import type { RaceResponse } from '../models/types';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Security: RFC 4180 CSV field sanitizer
function sanitizeCsvField(field: string | number | undefined | null | boolean): string {
  if (field === undefined || field === null) return '""';
  let str = String(field);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportRaceToCSV(raceData: RaceResponse) {
  const headers = ['Algorithm', 'Operations', 'Execution Time (ms)', 'Swaps / Path Steps', 'Winner', 'Dataset Config'];
  const rows: string[][] = [];

  const datasetConfig = raceData.type === 'sorting'
    ? (raceData.dataset ? `Array[${raceData.dataset.length}]` : 'N/A')
    : raceData.type === 'searching'
      ? (raceData.dataset ? `Array[${raceData.dataset.length}] Target: ${raceData.target}` : 'N/A')
      : (raceData.walls ? `Grid[${raceData.walls.length}x${raceData.walls[0].length}]` : 'N/A');

  raceData.lanes.forEach(lane => {
    const isWinner = raceData.winner === lane.name ? 'Yes' : 'No';
    let operations = 0;
    let secValue = 0;

    if (raceData.type === 'sorting') {
      operations = lane.stats.comparisons;
      secValue = lane.stats.swaps;
    } else if (raceData.type === 'searching') {
      operations = lane.stats.comparisons;
    } else {
      operations = lane.stats.comparisons;
      secValue = lane.stats.steps;
    }

    const row = [
      lane.name,
      operations.toString(),
      lane.stats.timeMs.toString(),
      secValue.toString(),
      isWinner,
      datasetConfig
    ];
    rows.push(row.map(sanitizeCsvField));
  });

  const csvContent = [
    headers.map(sanitizeCsvField).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `race_telemetry_${Date.now()}.csv`);
}

export function exportRaceToJSON(raceData: RaceResponse) {
  const telemetry = {
    type: raceData.type,
    winner: raceData.winner,
    datasetConfig: raceData.type === 'sorting'
      ? { size: raceData.dataset?.length }
      : raceData.type === 'searching'
        ? { size: raceData.dataset?.length, target: raceData.target }
        : { gridRows: raceData.walls?.length, gridCols: raceData.walls?.[0]?.length },
    results: raceData.lanes.map(lane => ({
      algorithm: lane.name,
      operations: raceData.type !== 'pathfinding' ? lane.stats.comparisons : lane.stats.steps,
      comparisons: lane.stats.comparisons,
      swaps: lane.stats.swaps,
      steps: lane.stats.steps,
      timeMs: lane.stats.timeMs,
      isWinner: raceData.winner === lane.name
    }))
  };

  const jsonContent = JSON.stringify(telemetry, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  triggerDownload(blob, `race_telemetry_${Date.now()}.json`);
}
