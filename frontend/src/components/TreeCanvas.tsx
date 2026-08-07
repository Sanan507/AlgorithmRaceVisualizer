import React, { useEffect, useRef } from 'react';
import { TreeNodeDto, TreeSimulationFrame } from '../models/types';

export interface TreeNode {
  val?: number;
  value?: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
  height?: number;
  balanceFactor?: number;
  color?: 'RED' | 'BLACK';
}

export interface TreeStep {
  root: TreeNode | TreeNodeDto | null;
  activeNodeId?: number;
  activeNodeVal?: number;
  highlightNodes?: number[];
  rotationType?: string | null;
  eventType?: string;
  explanation: string;
  codeLine?: number;
}

interface TreeCanvasProps {
  step: TreeStep | TreeSimulationFrame | null;
  treeType: 'bst' | 'avl' | 'red_black';
}

// Helper to safely extract active node value from either frame shape
export function getActiveNodeValue(step: TreeStep | TreeSimulationFrame | null): number | undefined {
  if (!step) return undefined;
  if ('activeNodeVal' in step && step.activeNodeVal !== null && step.activeNodeVal !== undefined) {
    return step.activeNodeVal;
  }
  if ('activeNodeId' in step && step.activeNodeId !== null && step.activeNodeId !== undefined) {
    return step.activeNodeId;
  }
  return undefined;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({ step, treeType }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parentWidth = canvas.parentElement?.clientWidth || 800;
    const parentHeight = 460;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = parentWidth * dpr;
    canvas.height = parentHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = parentWidth;
    const height = parentHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw subtle grid lines for intentional canvas structure
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!step || !step.root) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '500 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tree canvas is empty. Enter a value above and click Insert or select a Preset.', width / 2, height / 2);
      return;
    }

    const root = step.root;
    const activeVal = getActiveNodeValue(step);
    const highlightVals = step.highlightNodes || [];

    // Helper to extract numeric value from node
    const getNodeVal = (node: TreeNode | TreeNodeDto): number => {
      if ('val' in node && node.val !== undefined) return node.val;
      if ('value' in node && node.value !== undefined) return node.value;
      return 0;
    };

    // Calculate max depth for adaptive vertical spacing
    const getTreeDepth = (node: TreeNode | TreeNodeDto | null | undefined): number => {
      if (!node) return 0;
      return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
    };
    const maxDepth = getTreeDepth(root);
    const vGap = Math.max(48, Math.min(68, (height - 90) / Math.max(maxDepth, 3)));

    // Draw tree recursively
    const drawNode = (node: TreeNode | TreeNodeDto, x: number, y: number, offset: number, depth: number) => {
      const nodeVal = getNodeVal(node);

      // Left edge
      if (node.left) {
        const nextX = x - offset;
        const nextY = y + vGap;
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(nextX, nextY - 20);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawNode(node.left, nextX, nextY, Math.max(offset / 1.9, 28), depth + 1);
      }

      // Right edge
      if (node.right) {
        const nextX = x + offset;
        const nextY = y + vGap;
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(nextX, nextY - 20);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawNode(node.right, nextX, nextY, Math.max(offset / 1.9, 28), depth + 1);
      }

      // Active / Highlight states
      const isActive = activeVal === nodeVal;
      const isHighlighted = highlightVals.includes(nodeVal);

      ctx.beginPath();
      ctx.arc(x, y, 21, 0, 2 * Math.PI);

      if (treeType === 'red_black') {
        const isRed = node.color === 'RED';
        ctx.fillStyle = isRed ? '#ef4444' : '#1e293b';
        ctx.strokeStyle = isActive ? '#fbbf24' : isHighlighted ? '#3b82f6' : isRed ? '#f87171' : '#64748b';
        ctx.lineWidth = isActive ? 4 : 2;
      } else {
        if (isActive) ctx.fillStyle = '#f59e0b';
        else if (isHighlighted) ctx.fillStyle = '#2563eb';
        else ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = isActive ? '#fbbf24' : isHighlighted ? '#60a5fa' : '#64748b';
        ctx.lineWidth = isActive ? 3 : 2;
      }

      ctx.fill();
      ctx.stroke();

      // Text value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${nodeVal}`, x, y);

      // AVL Balance Factor tag ONLY in AVL mode
      if (treeType === 'avl' && node.balanceFactor !== undefined) {
        const bf = node.balanceFactor;
        const isUnbalanced = Math.abs(bf) > 1;
        ctx.fillStyle = isUnbalanced ? '#ef4444' : '#10b981';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`BF: ${bf}`, x, y - 27);
      }
    };

    // Calculate initial Y position so single node is centered nicely
    const hasChildren = !!(root.left || root.right);
    const startY = hasChildren ? 48 : height / 2;

    drawNode(root, width / 2, startY, width / 4.2, 1);
  }, [step, treeType]);

  const rotation = step?.rotationType;
  const eventType = step?.eventType;

  return (
    <div className="tree-canvas-wrapper" style={{ position: 'relative' }}>
      {rotation && (
        <div className="rotation-banner" style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '8px',
          padding: '5px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(4px)',
          zIndex: 10
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: '#f59e0b',
            color: '#0f172a',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>Rotation</span>
          <strong style={{ fontSize: '12px', color: '#fef08a' }}>{rotation} Rotation Executed</strong>
        </div>
      )}

      {eventType === 'RECOLOR' && (
        <div className="rotation-banner" style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          padding: '5px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(4px)',
          zIndex: 10
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: '#ef4444',
            color: '#ffffff',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>Recolor</span>
          <strong style={{ fontSize: '12px', color: '#fca5a5' }}>Red-Black Recolor Event</strong>
        </div>
      )}

      <canvas ref={canvasRef} className="tree-canvas" style={{ width: '100%', height: '460px', display: 'block' }} />
    </div>
  );
};
