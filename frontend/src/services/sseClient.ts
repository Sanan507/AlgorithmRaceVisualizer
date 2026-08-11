import type { RaceResponse, SimulationFrame } from '../models/types';

export type LaneFrameEvent = {
  laneName: string;
  frame: SimulationFrame;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function createSimulationStream(
  endpoint: string,
  params: Record<string, any>,
  onStart: (initialResponse: RaceResponse) => void,
  onFrame: (event: LaneFrameEvent) => void,
  onEnd: (finalResponse: RaceResponse) => void,
  onError: (error: Event) => void
): () => void {
  const finalParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (key === 'walls' || key === 'weights') continue;
    if (Array.isArray(value)) {
      value.forEach((v) => finalParams.append(key, v.toString()));
    } else {
      finalParams.append(key, value.toString());
    }
  }

  if (params.walls) {
     params.walls.forEach((row: boolean[]) => {
       finalParams.append('walls', row.join(','));
     });
  }
  if (params.weights) {
     params.weights.forEach((row: number[]) => {
       finalParams.append('weights', row.join(','));
     });
  }

  const url = `${API_BASE_URL}${endpoint}?${finalParams.toString()}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener('START', (event: MessageEvent) => {
    onStart(JSON.parse(event.data) as RaceResponse);
  });

  eventSource.addEventListener('FRAME', (event: MessageEvent) => {
    onFrame(JSON.parse(event.data) as LaneFrameEvent);
  });

  eventSource.addEventListener('END', (event: MessageEvent) => {
    onEnd(JSON.parse(event.data) as RaceResponse);
    eventSource.close();
  });

  eventSource.onerror = (error) => {
    onError(error);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}
