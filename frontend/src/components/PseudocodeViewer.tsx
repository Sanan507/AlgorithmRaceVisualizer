/**
 * PseudocodeViewer — thin backwards-compatible delegate.
 * All consumers (LaneCard, AlgorithmComparisonCenter) that still import
 * PseudocodeViewer will render the new multi-language CodeViewer under the hood.
 */
import { CodeViewer } from './CodeViewer';
import type { SimulationFrame } from '../models/types';

export interface PseudocodeViewerProps {
  algorithmName: string;
  pseudocode: string;
  currentFrame?: SimulationFrame | null;
  prevFrame?: SimulationFrame | null;
  totalFrames?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  readOnly?: boolean;
}

export function PseudocodeViewer(props: PseudocodeViewerProps) {
  return (
    <CodeViewer
      algorithmName={props.algorithmName}
      fallbackPseudocode={props.pseudocode}
      currentFrame={props.readOnly ? null : props.currentFrame}
      prevFrame={props.readOnly ? null : props.prevFrame}
      totalFrames={props.totalFrames}
      collapsed={props.collapsed}
      onToggleCollapse={props.onToggleCollapse}
      className={props.className}
      readOnly={props.readOnly}
    />
  );
}
