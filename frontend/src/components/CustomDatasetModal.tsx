import { useState } from 'react';
import { Sliders, Activity, Check, X } from 'lucide-react';

export interface CustomDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (array: number[], label: string) => void;
  currentSize?: number;
}

export function CustomDatasetModal({
  isOpen,
  onClose,
  onApplyDataset,
  currentSize = 40,
}: CustomDatasetModalProps) {
  const [customInput, setCustomInput] = useState('15, 42, 8, 99, 23, 74, 51, 3, 67, 88');
  const [selectedPreset, setSelectedPreset] = useState<string>('Custom');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generatePreset = (type: string, size: number = currentSize): number[] => {
    const res: number[] = [];
    if (type === 'Sine Wave') {
      for (let i = 0; i < size; i++) {
        const val = Math.round(50 + 40 * Math.sin((i / size) * Math.PI * 4));
        res.push(Math.max(5, val));
      }
    } else if (type === 'Gaussian Distribution') {
      for (let i = 0; i < size; i++) {
        const x = (i - size / 2) / (size / 6);
        const val = Math.round(100 * Math.exp(-0.5 * x * x));
        res.push(Math.max(5, val));
      }
    } else if (type === 'Inverse Bell') {
      for (let i = 0; i < size; i++) {
        const x = (i - size / 2) / (size / 6);
        const val = Math.round(100 * (1 - Math.exp(-0.5 * x * x)));
        res.push(Math.max(5, val));
      }
    } else if (type === 'Nearly Sorted') {
      for (let i = 1; i <= size; i++) {
        let val = i * 2 + 5;
        if (i % 8 === 0 && i + 1 <= size) val += Math.floor(Math.random() * 20 - 10);
        res.push(Math.max(5, val));
      }
    } else if (type === 'Sawtooth') {
      const period = Math.max(5, Math.floor(size / 4));
      for (let i = 0; i < size; i++) {
        const val = Math.round(((i % period) / period) * 90 + 10);
        res.push(val);
      }
    }
    return res;
  };

  const handleSelectPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const arr = generatePreset(presetName, currentSize);
    setCustomInput(arr.join(', '));
    setValidationError(null);
  };

  const handleApply = () => {
    const rawTokens = customInput.split(/[\s,]+/);
    const parsed: number[] = [];

    for (const token of rawTokens) {
      if (!token) continue;
      const num = Number(token);
      if (isNaN(num)) {
        setValidationError(`Invalid number token "${token}". Please enter valid numbers separated by commas.`);
        return;
      }
      parsed.push(num);
    }

    if (parsed.length < 2) {
      setValidationError('Dataset must contain at least 2 numbers.');
      return;
    }
    if (parsed.length > 200) {
      setValidationError('Dataset cannot exceed 200 elements.');
      return;
    }

    setValidationError(null);
    onApplyDataset(parsed, selectedPreset);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <header className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} className="text-indigo-400" />
            <h3>Mathematical Dataset Generator</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="modal-body">
          {/* Mathematical Presets */}
          <label className="modal-label">Preset Mathematical Function</label>
          <div className="preset-grid">
            {['Sine Wave', 'Gaussian Distribution', 'Inverse Bell', 'Nearly Sorted', 'Sawtooth'].map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-chip ${selectedPreset === preset ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <Activity size={14} />
                  <span>{preset}</span>
                </button>
              )
            )}
          </div>

          {/* Raw Custom Input */}
          <label className="modal-label" style={{ marginTop: '16px' }}>
            Or Paste Custom CSV Array Values
          </label>
          <textarea
            className="modal-textarea"
            rows={4}
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setSelectedPreset('Custom');
              setValidationError(null);
            }}
            placeholder="e.g. 10, 45, 23, 88, 12, 67, 34"
          />

          {validationError && (
            <div className="modal-error">
              ⚠️ {validationError}
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={handleApply}>
            <Check size={16} /> Apply Dataset
          </button>
        </footer>
      </div>
    </div>
  );
}
