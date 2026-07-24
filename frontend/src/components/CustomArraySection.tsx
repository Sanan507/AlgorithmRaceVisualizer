import React, { useState, useEffect, useMemo } from 'react';

interface CustomArraySectionProps {
  arenaType: 'sorting' | 'searching';
  initialArrayText?: string;
  initialTargetText?: string;
  isActive: boolean;
  onLoadArray: (numbers: number[], target?: number) => void;
  onClear?: () => void;
}

export function CustomArraySection({
  arenaType,
  initialArrayText = arenaType === 'sorting' ? '5, 3, 8, 1, 9, 2' : '10, 5, 20, 15, 30',
  initialTargetText = '20',
  isActive,
  onLoadArray,
  onClear,
}: CustomArraySectionProps) {
  const [rawText, setRawText] = useState(initialArrayText);
  const [targetText, setTargetText] = useState(initialTargetText);
  const [isTouched, setIsTouched] = useState(false);

  // Sync if initial props change
  useEffect(() => {
    if (initialArrayText !== undefined) {
      setRawText(initialArrayText);
    }
  }, [initialArrayText]);

  useEffect(() => {
    if (initialTargetText !== undefined) {
      setTargetText(initialTargetText);
    }
  }, [initialTargetText]);

  // Validation logic for array input
  const { validNumbers, invalidTokens, isArrayEmpty } = useMemo(() => {
    if (!rawText.trim()) {
      return { validNumbers: [], invalidTokens: [], isArrayEmpty: true };
    }

    const tokens = rawText.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
    const valid: number[] = [];
    const invalid: string[] = [];

    for (const token of tokens) {
      if (/^-?\d+$/.test(token)) {
        valid.push(Number(token));
      } else {
        invalid.push(token);
      }
    }

    return {
      validNumbers: valid,
      invalidTokens: invalid,
      isArrayEmpty: valid.length === 0 && invalid.length === 0,
    };
  }, [rawText]);

  // Validation logic for target input (only for searching arena)
  const isTargetValid = useMemo(() => {
    if (arenaType !== 'searching') return true;
    return /^-?\d+$/.test(targetText.trim());
  }, [arenaType, targetText]);

  const hasInvalidArray = invalidTokens.length > 0;
  const isFormValid = !isArrayEmpty && !hasInvalidArray && isTargetValid && validNumbers.length > 0;

  function handleLoad() {
    setIsTouched(true);
    if (!isFormValid) return;

    const parsedTarget = arenaType === 'searching' ? Number(targetText.trim()) : undefined;
    onLoadArray(validNumbers, parsedTarget);
  }

  function handleClearClick() {
    setRawText('');
    if (arenaType === 'searching') {
      setTargetText('');
    }
    setIsTouched(false);
    if (onClear) onClear();
  }

  const placeholderText =
    arenaType === 'sorting' ? 'Example: 5, 3, 8, 1, 9, 2' : 'Example: 10, 5, 20, 15, 30';

  return (
    <section className={`panel custom-array-panel ${isActive ? 'custom-array-active' : ''}`}>
      <div className="custom-array-header">
        <div className="custom-array-title-group">
          <div className="custom-array-icon">⚡</div>
          <h3>Custom Array</h3>
          <span className={`custom-status-badge ${isActive ? 'active' : 'idle'}`}>
            {isActive ? 'Active Dataset' : 'In Memory'}
          </span>
        </div>
        {isActive && (
          <div className="custom-active-indicator">
            <span className="pulse-dot"></span>
            Using Custom Dataset ({validNumbers.length} elements)
          </div>
        )}
      </div>

      <div className="custom-array-body">
        <div className={`custom-fields-grid ${arenaType === 'searching' ? 'searching-grid' : ''}`}>
          <label className="field wide">
            <span>Array Values (comma-separated integers)</span>
            <input
              type="text"
              className={`custom-input ${hasInvalidArray ? 'input-error' : ''}`}
              value={rawText}
              placeholder={placeholderText}
              onChange={(e) => {
                setRawText(e.target.value);
                setIsTouched(true);
              }}
            />
          </label>

          {arenaType === 'searching' && (
            <label className="field target-field">
              <span>Target Value</span>
              <input
                type="number"
                className={`custom-input ${!isTargetValid && isTouched ? 'input-error' : ''}`}
                value={targetText}
                placeholder="e.g. 20"
                onChange={(e) => {
                  setTargetText(e.target.value);
                  setIsTouched(true);
                }}
              />
            </label>
          )}
        </div>

        {/* Validation messages */}
        {hasInvalidArray && (
          <div className="validation-banner error">
            <span className="banner-icon">⚠️</span>
            <span>
              Invalid value{invalidTokens.length > 1 ? 's' : ''}:{' '}
              {invalidTokens.map((t, idx) => (
                <strong key={idx} className="invalid-tag">
                  "{t}"
                </strong>
              ))}
              . Please enter integers only.
            </span>
          </div>
        )}

        {!hasInvalidArray && isArrayEmpty && isTouched && (
          <div className="validation-banner warning">
            <span className="banner-icon">ℹ️</span>
            <span>Array cannot be empty. Please enter comma-separated integers.</span>
          </div>
        )}

        {arenaType === 'searching' && !isTargetValid && isTouched && (
          <div className="validation-banner error">
            <span className="banner-icon">⚠️</span>
            <span>Please enter a valid target integer.</span>
          </div>
        )}

        {!hasInvalidArray && !isArrayEmpty && isFormValid && (
          <div className="validation-banner success">
            <span className="banner-icon">✓</span>
            <span>
              Ready to load {validNumbers.length} integer{validNumbers.length > 1 ? 's' : ''}
              {arenaType === 'searching' ? ` with target value ${targetText.trim()}` : ''}.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="custom-array-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!isFormValid}
            onClick={handleLoad}
          >
            {arenaType === 'sorting' ? 'Load Array' : 'Load Dataset'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClearClick}>
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
