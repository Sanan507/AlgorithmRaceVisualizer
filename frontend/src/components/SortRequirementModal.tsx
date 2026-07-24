import React from 'react';

interface SortRequirementModalProps {
  isOpen: boolean;
  algorithmName: string;
  onSort: () => void;
  onCancel: () => void;
}

export function SortRequirementModal({
  isOpen,
  algorithmName,
  onSort,
  onCancel,
}: SortRequirementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">⚠️</div>
          <h3>Sorted Array Required</h3>
        </div>
        <div className="modal-body">
          <p>
            <strong>{algorithmName || 'Selected search algorithm'}</strong> requires a sorted array. Sort automatically?
          </p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSort}>
            Sort Automatically
          </button>
        </div>
      </div>
    </div>
  );
}
