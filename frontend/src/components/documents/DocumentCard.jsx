// src/components/documents/DocumentCard.jsx
import { FileText, File, Trash2, Clock, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDocument } from '../../api/documents.api';
import { useState } from 'react';
import Modal from '../ui/Modal';
import MarkdownRenderer from '../ui/MarkdownRenderer';

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
  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(doc._id),
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

    {/* Document Viewer Modal */}
    <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title={doc.name} width={700}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Modal Header Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`status-dot ${status.dot}`} />
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>AI: {status.label}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {doc.fileType?.toUpperCase()} · {formatSize(doc.fileSize)}
          </div>
        </div>

        {/* AI Summary Section */}
        {doc.aiSummary && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> AI Summary
            </div>
            <div style={{ background: 'var(--color-surface-2)', padding: '16px 20px', borderRadius: 16, border: '1px solid var(--color-border)' }}>
              <MarkdownRenderer content={doc.aiSummary} />
            </div>
          </div>
        )}

        {/* Extracted Text Section */}
        {doc.extractedText && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Extracted Text
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', background: 'var(--color-surface-0)', border: '1px solid var(--color-border-strong)', padding: 16, borderRadius: 16, fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {doc.extractedText?.length > 50000 ? doc.extractedText.slice(0, 50000) + '\n\n... [Text truncated for performance]' : doc.extractedText}
            </div>
          </div>
        )}

        {/* Tags */}
        {doc.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
            {doc.tags.filter(Boolean).map((tag) => (
              <span key={tag._id || tag} className="tag-pill" style={{ color: tag.color || 'var(--color-primary-dark)' }}>
                #{tag.name || tag}
              </span>
            ))}
          </div>
        )}

      </div>
    </Modal>
  </>
  );
}
