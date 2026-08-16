import React, { useState, useEffect } from 'react';
import { Share2, Check, Copy, ExternalLink, X, Sparkles, Layers, Code2, Link } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedHeight, setEmbedHeight] = useState(520);
  const { play } = useAudio();

  const shareUrl = React.useMemo(() => {
    return generateShareableUrl(config);
  }, [config]);

  const embedUrl = React.useMemo(() => {
    const url = new URL(shareUrl);
    url.searchParams.set('embed', 'true');
    return url.href;
  }, [shareUrl]);

  const embedSnippet = `<iframe src="${embedUrl}" width="100%" height="${embedHeight}" frameborder="0" loading="lazy" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 12px 32px rgba(0,0,0,0.5);"></iframe>`;

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      play('click');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet).then(() => {
      setCopiedEmbed(true);
      play('click');
      setTimeout(() => setCopiedEmbed(false), 2500);
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
                Share & Embed Benchmark
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Collaborate with encoded URLs or embed interactive races in blog posts
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-line)', padding: '0 24px' }}>
          <button
            type="button"
            className={`share-tab-btn ${activeTab === 'link' ? 'active' : ''}`}
            onClick={() => setActiveTab('link')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'link' ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === 'link' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Link size={15} />
            <span>Share Link</span>
          </button>
          <button
            type="button"
            className={`share-tab-btn ${activeTab === 'embed' ? 'active' : ''}`}
            onClick={() => setActiveTab('embed')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'embed' ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === 'embed' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Code2 size={15} />
            <span>Embed Widget</span>
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

          {activeTab === 'link' ? (
            /* Shareable Link Tab */
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
                  className={`btn share-copy-btn ${copiedLink ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleCopyLink}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Embed Widget Tab */
            <div className="share-url-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="embed-code-textarea" style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  HTML &lt;iframe&gt; Embed Code
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  <span>Height:</span>
                  <select
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(Number(e.target.value))}
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-line)', borderRadius: '6px', color: 'var(--color-text-primary)', padding: '2px 6px', fontSize: '0.78rem' }}
                  >
                    <option value={420}>420px (Compact)</option>
                    <option value={520}>520px (Standard)</option>
                    <option value={640}>640px (Spacious)</option>
                  </select>
                </div>
              </div>
              <div className="share-url-input-container" style={{ alignItems: 'stretch' }}>
                <textarea
                  id="embed-code-textarea"
                  readOnly
                  rows={3}
                  value={embedSnippet}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  className="share-url-input"
                  style={{ resize: 'none', lineHeight: 1.4 }}
                />
                <button
                  type="button"
                  className={`btn share-copy-btn ${copiedEmbed ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleCopyEmbed}
                  style={{ alignSelf: 'flex-start', minHeight: '44px' }}
                >
                  {copiedEmbed ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedEmbed ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
          )}

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

