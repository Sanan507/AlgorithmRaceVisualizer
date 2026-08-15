import React, { useState, useEffect } from 'react';
import { Share2, Check, Copy, ExternalLink, X, Sparkles, Layers, Sliders } from 'lucide-react';
import { ShareableBenchmarkConfig, generateShareableUrl } from '../utils/shareableBenchmark';
import { useAudio } from '../context/AudioContext';

interface ShareBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShareableBenchmarkConfig;
}

export const ShareBenchmarkModal: React.FC<ShareBenchmarkModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  const { play } = useAudio();

  const shareUrl = React.useMemo(() => {
    return generateShareableUrl(config);
  }, [config]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      play('click');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleOpenNewTab = () => {
    window.open(shareUrl, '_blank');
  };

  const datasetPreview = config.customArray && config.customArray.length > 0
    ? `[${config.customArray.slice(0, 8).join(', ')}${config.customArray.length > 8 ? `, ... +${config.customArray.length - 8} more` : ''}]`
    : `${config.datasetType || 'Random'} Dataset (${config.size || 30} elements)`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="modal-card share-benchmark-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="share-icon-badge">
              <Share2 size={18} className="text-cyan-400" />
            </div>
            <div>
              <h3 id="share-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Share Benchmark Setup
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Collaborate and compare exact dataset executions with encoded URLs
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '20px 24px' }}>
          {/* Benchmark Configuration Summary Box */}
          <div className="share-config-preview-box">
            <div className="share-preview-row">
              <span className="share-preview-label">Arena:</span>
              <span className="share-preview-value capitalize-text">
                <Layers size={13} className="text-indigo-400" /> {config.arena} Arena
              </span>
            </div>

            {config.algorithms && config.algorithms.length > 0 && (
              <div className="share-preview-row">
                <span className="share-preview-label">Algorithms:</span>
                <div className="share-algo-chips">
                  {config.algorithms.map((algo, idx) => (
                    <span key={`${algo}-${idx}`} className="share-algo-chip">
                      {algo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="share-preview-row">
              <span className="share-preview-label">Dataset:</span>
              <span className="share-preview-value font-mono">
                {datasetPreview}
              </span>
            </div>

            {config.target !== undefined && (
              <div className="share-preview-row">
                <span className="share-preview-label">Search Target:</span>
                <span className="share-preview-value font-mono text-emerald-400">
                  {config.target}
                </span>
              </div>
            )}
          </div>

          {/* Copyable Share URL Input Field */}
          <div className="share-url-field-group">
            <label htmlFor="share-url-input" style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shareable Link
            </label>
            <div className="share-url-input-container">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="share-url-input"
              />
              <button
                type="button"
                className={`btn share-copy-btn ${copied ? 'btn-success' : 'btn-primary'}`}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Extra Developer Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <Sparkles size={14} className="text-amber-400" />
              <span>Includes exact seed array & algorithms</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={handleOpenNewTab}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            >
              <ExternalLink size={14} />
              <span>Open in New Tab</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
