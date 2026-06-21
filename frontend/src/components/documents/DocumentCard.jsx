// src/components/documents/DocumentCard.jsx
import { FileText, File, Trash2, Clock, Zap, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDocument, generateDocumentSummary } from '../../api/documents.api';
import Modal from '../ui/Modal';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { useNavigate } from 'react-router-dom';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatSize = (bytes) => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

const statusMap = {
  pending:    { label: 'Pending',    dot: 'pending' },
  processing: { label: 'Processing', dot: 'pending' },
  completed:  { label: 'Ready',      dot: 'completed' },
  failed:     { label: 'Failed',     dot: 'failed' },
};

export default function DocumentCard({ doc }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(doc._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const generateSummaryMutation = useMutation({
    mutationFn: () => generateDocumentSummary(doc._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const status = statusMap[doc.processingStatus] || statusMap.pending;

  return (
    <>
      <div 
        className="glass-card" 
        style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
        onClick={() => setIsViewerOpen(true)}
      >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: doc.fileType === 'pdf' ? 'rgba(244,63,94,0.12)' : 'rgba(6,194,168,0.12)',
              border: `1px solid ${doc.fileType === 'pdf' ? 'rgba(244,63,94,0.25)' : 'rgba(6,194,168,0.25)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: doc.fileType === 'pdf' ? 'var(--color-rose)' : 'var(--color-accent)',
            }}
          >
            {doc.fileType === 'pdf' ? <FileText size={18} /> : <File size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {doc.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 1 }}>
              {doc.fileType?.toUpperCase()} · {formatSize(doc.fileSize)}
            </div>
          </div>
        </div>
        <button
          className="btn-danger"
          style={{ padding: '5px 7px', flexShrink: 0 }}
          onClick={(e) => { e.stopPropagation(); if (confirm('Delete this document?')) deleteMutation.mutate(); }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Processing Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className={`status-dot ${status.dot}`} />
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          AI: {status.label}
        </span>
      </div>

      {/* AI Summary */}
      {doc.aiSummary && (
        <div
          style={{
            background: 'var(--color-accent-glow)',
            border: '1px solid rgba(6,194,168,0.2)',
            borderRadius: 8, padding: '8px 10px',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-accent)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} /> AI Summary
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {doc.aiSummary}
          </p>
        </div>
      )}

      {/* Tags */}
      {doc.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {doc.tags.filter(Boolean).map((tag) => (
            <span
              key={tag._id || tag}
              className="tag-pill"
              style={{ color: tag.color || '#7c6fff', borderColor: `${tag.color || '#7c6fff'}40`, background: `${tag.color || '#7c6fff'}15` }}
            >
              #{tag.name || tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Clock size={11} style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatDate(doc.createdAt)}</span>
      </div>
    </div>

    {/* Quick Preview Modal */}
    <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title="Quick Preview" width={600}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: 'var(--color-text-primary)' }}>{doc.name}</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`status-dot ${status.dot}`} />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>AI: {status.label}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {doc.fileType?.toUpperCase()} · {formatSize(doc.fileSize)}
          </div>
        </div>

        {/* Short Text Preview */}
        {doc.extractedText && (
          <div style={{ background: 'var(--color-surface-2)', padding: 16, borderRadius: 12, fontSize: 13, color: 'var(--color-text-secondary)', maxHeight: 150, overflow: 'hidden', position: 'relative' }}>
            {doc.extractedText.slice(0, 400)}...
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, var(--color-surface-2))' }} />
          </div>
        )}

        {/* Existing AI Output */}
        {doc.aiSummary && (
          <div style={{ background: 'var(--color-primary-glow)', padding: 16, borderRadius: 12, border: '1px solid var(--color-primary-light)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={12}/> AI SUMMARY</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <MarkdownRenderer content={doc.aiSummary.length > 300 ? doc.aiSummary.slice(0, 300) + '...' : doc.aiSummary} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate(`/resource/document/${doc._id}`)}>
            <ExternalLink size={16} /> Open Full Resource
          </button>
          {!doc.aiSummary && status.dot !== 'pending' && (
            <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => generateSummaryMutation.mutate()} disabled={generateSummaryMutation.isPending}>
              <Zap size={16} /> {generateSummaryMutation.isPending ? 'Generating...' : 'Generate Summary'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  </>
  );
}
