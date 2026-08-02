import { useState } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Bot, Sparkles, BrainCircuit, Layers } from 'lucide-react';

export interface StepExplanationCardProps {
  lanes?: RaceLaneResponse[];
  activeFrames?: (SimulationFrame | null | undefined)[];
  frameIndex: number;
  totalFrames: number;
  algorithmName?: string;
  frame?: SimulationFrame | null;
}

export function StepExplanationCard({
  lanes = [],
  activeFrames = [],
  frameIndex,
  totalFrames,
  algorithmName,
  frame,
}: StepExplanationCardProps) {
  const [selectedLane, setSelectedLane] = useState(0);

  // Fallback if single lane passed
  const activeLaneObj = lanes[selectedLane] ?? (algorithmName ? { name: algorithmName } : null);
  const activeFrameObj = activeFrames[selectedLane] ?? frame ?? null;

  if (!activeFrameObj && !activeLaneObj) return null;

  const currentAlgoName = activeLaneObj?.name || algorithmName || 'Algorithm';

  // Generate dynamic, rich, educational mini-bot step explanation
  let explanationText = activeFrameObj?.explanation;

  if (!explanationText) {
    if (activeFrameObj?.done) {
      explanationText = `🎉 ${currentAlgoName} has completed sorting all elements! Total workload: ${activeFrameObj.comparisons ?? 0} comparisons and ${activeFrameObj.swaps ?? 0} swaps.`;
    } else if (activeFrameObj?.highlight && activeFrameObj.highlight.length === 2) {
      const idx1 = activeFrameObj.highlight[0];
      const idx2 = activeFrameObj.highlight[1];
      const val1 = activeFrameObj.array?.[idx1];
      const val2 = activeFrameObj.array?.[idx2];
      if (val1 !== undefined && val2 !== undefined) {
        if (val1 > val2) {
          explanationText = `⚡ ${currentAlgoName}: Comparing index ${idx1} (val ${val1}) with index ${idx2} (val ${val2}). Since ${val1} > ${val2}, swapping positions...`;
        } else {
          explanationText = `🔍 ${currentAlgoName}: Comparing index ${idx1} (val ${val1}) with index ${idx2} (val ${val2}). Order ${val1} ≤ ${val2} is correct.`;
        }
      } else {
        explanationText = `🔍 ${currentAlgoName}: Inspecting elements at index ${idx1} and index ${idx2}.`;
      }
    } else if (activeFrameObj?.pivotIndex !== undefined && activeFrameObj.pivotIndex >= 0) {
      const pVal = activeFrameObj.array?.[activeFrameObj.pivotIndex];
      explanationText = `🎯 ${currentAlgoName}: Selected pivot element ${pVal} at index ${activeFrameObj.pivotIndex}. Partitioning remaining subarray elements...`;
    } else if (activeFrameObj?.foundIndex !== null && activeFrameObj?.foundIndex !== undefined) {
      if (activeFrameObj.foundIndex >= 0) {
        explanationText = `🎯 ${currentAlgoName}: Target match found at array index ${activeFrameObj.foundIndex}! Search terminates successfully.`;
      } else {
        explanationText = `🔍 ${currentAlgoName}: Scanning search space for target element...`;
      }
    } else if (activeFrameObj?.grid && activeFrameObj?.path && activeFrameObj.path.length > 0) {
      explanationText = `📍 ${currentAlgoName}: Optimal grid path computed containing ${activeFrameObj.path.length} steps.`;
    } else {
      explanationText = `🤖 AlgoBot analyzing frame ${frameIndex + 1} of ${totalFrames} for ${currentAlgoName}...`;
    }
  }

  return (
    <div className="algobot-card">
      {/* Bot Header */}
      <div className="algobot-header">
        <div className="algobot-identity">
          <div className="algobot-avatar">
            <Bot size={24} className="algobot-icon" />
            <span className="algobot-pulse" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '1rem', letterSpacing: '0.2px' }}>AlgoBot — Live AI Step Tutor</strong>
              <Sparkles size={14} className="text-amber-400" />
            </div>
            <span className="algobot-subtitle">Interactive execution analysis & reasoning engine</span>
          </div>
        </div>

        <div className="algobot-right-meta">
          {lanes.length > 1 && (
            <div className="algobot-lane-selector">
              <Layers size={13} className="text-indigo-400" />
              <span>Lane:</span>
              {lanes.map((lane, index) => (
                <button
                  key={lane.name + index}
                  type="button"
                  className={`algobot-lane-btn ${selectedLane === index ? 'active' : ''}`}
                  onClick={() => setSelectedLane(index)}
                >
                  {lane.name}
                </button>
              ))}
            </div>
          )}

          <div className="algobot-badge">
            <BrainCircuit size={13} />
            <span>Frame {frameIndex + 1} / {totalFrames}</span>
          </div>
        </div>
      </div>

      {/* Bot Message Bubble */}
      <div className="algobot-bubble">
        <div className="algobot-bubble-tail" />
        <p className="algobot-text">{explanationText}</p>
      </div>
    </div>
  );
}
