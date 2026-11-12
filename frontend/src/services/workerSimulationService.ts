/**
 * workerSimulationService.ts
 * Client service interface for offloading simulations to Web Workers.
 * Provides 100% UI thread isolation, progress callbacks, and cancellation.
 */

import { RaceResponse } from '../models/types';
import { WorkerSimulationRequest, WorkerSimulationResponse } from '../workers/simulationWorker';

export const DEFAULT_WORKER_TIMEOUT_MS = 15000;

class WorkerSimulationService {
  private worker: Worker | null = null;
  private currentRequestId = 0;
  private pendingResolvers: Map<
    string,
    {
      resolve: (data: RaceResponse) => void;
      reject: (err: any) => void;
      onProgress?: (percent: number, algo: string) => void;
      timer?: ReturnType<typeof setTimeout>;
    }
  > = new Map();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return;
    }

    try {
      this.worker = new Worker(
        new URL('../workers/simulationWorker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'progress') {
          const { requestId, progress, currentAlgorithm } = msg;
          const handler = this.pendingResolvers.get(requestId);
          if (handler && handler.onProgress) {
            handler.onProgress(progress, currentAlgorithm);
          }
        } else if (msg.type === 'result') {
          const response: WorkerSimulationResponse = msg.data;
          const handler = this.pendingResolvers.get(response.id || '');
          if (handler) {
            if (handler.timer) {
              clearTimeout(handler.timer);
            }
            this.pendingResolvers.delete(response.id || '');
            
            // Map worker response to RaceResponse format
            const raceResponse: RaceResponse = {
              type: response.type || 'sorting',
              dataset: response.dataset,
              target: response.target ?? null,
              walls: null,
              weights: null,
              lanes: response.lanes.map((l) => ({
                name: l.name,
                complexity: l.complexity,
                complexityInfo: {
                  best: 'O(n log n)',
                  average: 'O(n log n)',
                  worst: l.complexity,
                  space: 'O(1)',
                  theory: 'Simulated with 100% CPU thread isolation in Web Worker.',
                  pseudocode: '',
                },
                frames: l.frames as any,
                stats: l.stats,
              })),
              winner: response.winner,
            };

            handler.resolve(raceResponse);
          }
        } else if (msg.type === 'error') {
          const { id, error } = msg;
          const handler = this.pendingResolvers.get(id || '');
          if (handler) {
            if (handler.timer) {
              clearTimeout(handler.timer);
            }
            this.pendingResolvers.delete(id || '');
            handler.reject(new Error(error || 'Worker simulation failed'));
          }
        }
      };

      this.worker.onerror = (err) => {
        console.error('Simulation Web Worker Error:', err);
        const error = new Error('Simulation Web Worker encountered an error');
        this.pendingResolvers.forEach((handler) => {
          if (handler.timer) {
            clearTimeout(handler.timer);
          }
          handler.reject(error);
        });
        this.pendingResolvers.clear();
      };
    } catch (e) {
      console.warn('Failed to initialize Web Worker (fallback will be used):', e);
      this.worker = null;
    }
  }

  public isWorkerAvailable(): boolean {
    return this.worker !== null;
  }

  public runSimulation(
    params: {
      type: 'sorting' | 'searching';
      algorithms: string[];
      array: number[];
      target?: number;
      maxFramesBudget?: number;
    },
    onProgress?: (percent: number, currentAlgo: string) => void
  ): Promise<RaceResponse> {
    const requestId = `req_${++this.currentRequestId}`;

    return new Promise<RaceResponse>((resolve, reject) => {
      if (!this.worker) {
        this.initWorker();
      }

      if (!this.worker) {
        reject(new Error('Web Worker not supported in this environment'));
        return;
      }

      const timer = setTimeout(() => {
        const handler = this.pendingResolvers.get(requestId);
        if (handler) {
          this.pendingResolvers.delete(requestId);
          handler.reject(new Error(`Worker simulation timed out after ${DEFAULT_WORKER_TIMEOUT_MS}ms`));
        }
      }, DEFAULT_WORKER_TIMEOUT_MS);

      this.pendingResolvers.set(requestId, { resolve, reject, onProgress, timer });

      const requestPayload: WorkerSimulationRequest = {
        id: requestId,
        type: params.type,
        algorithms: params.algorithms,
        array: params.array,
        target: params.target,
        maxFramesBudget: params.maxFramesBudget || (params.array.length > 1000 ? 600 : 1200),
      };

      this.worker.postMessage(requestPayload);
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    const terminationError = new Error('Simulation Web Worker was terminated');
    this.pendingResolvers.forEach((handler) => {
      if (handler.timer) {
        clearTimeout(handler.timer);
      }
      handler.reject(terminationError);
    });
    this.pendingResolvers.clear();
  }
}

export const workerSimulationService = new WorkerSimulationService();
