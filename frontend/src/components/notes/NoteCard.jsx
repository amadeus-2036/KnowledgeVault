// src/components/notes/NoteCard.jsx
import { Pin, PinOff, Trash2, Edit, Clock, ExternalLink, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote, togglePin, generateNoteSummary } from '../../api/notes.api';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { useState } from 'react';
import Modal from '../ui/Modal';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function NoteCard({ note, onEdit }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(note._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const pinMutation = useMutation({
    mutationFn: () => togglePin(note._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const generateSummaryMutation = useMutation({
    mutationFn: () => generateNoteSummary(note._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  return (
    <>
    <div
      className="glass-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => setIsPreviewOpen(true)}
    >
      {/* Pinned indicator */}
      {note.isPinned && (
        <div
          style={{
            position: 'absolute', top: 0, right: 0, width: 0, height: 0,
            borderLeft: '30px solid transparent',
            borderTop: '30px solid var(--color-primary)',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3
          style={{
            margin: 0, fontSize: 15, fontWeight: 600,
            color: 'var(--color-text-primary)', lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}
        >
          {note.title}
        </h3>

        {/* Action buttons */}
        <div
          style={{ display: 'flex', gap: 4, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn-ghost"
            style={{ padding: '5px 7px' }}
            onClick={() => pinMutation.mutate()}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            className="btn-ghost"
            style={{ padding: '5px 7px' }}
            onClick={() => onEdit(note)}
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            className="btn-danger"
            style={{ padding: '5px 7px' }}
            onClick={() => {
              if (confirm('Delete this note?')) deleteMutation.mutate();
            }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content preview */}
      <div
        style={{
          margin: '4px 0',
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          maxHeight: 100,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          position: 'relative',
        }}
      >
        <MarkdownRenderer content={note.content?.length > 600 ? note.content.slice(0, 600) + '...' : note.content} />
      </div>

      {/* AI Summary */}
      {note.aiSummary && (
        <div
          style={{
            background: 'var(--color-primary-glow)',
            border: '1px solid rgba(124,111,255,0.2)',
            borderRadius: 8, padding: '7px 10px',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI Summary
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {note.aiSummary}
          </p>
        </div>
      )}

      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {note.tags.filter(Boolean).map((tag) => (
            <span
              key={tag._id || tag}
              className="tag-pill"
              style={{
                color: tag.color || '#7c6fff',
                borderColor: `${tag.color || '#7c6fff'}40`,
                background: `${tag.color || '#7c6fff'}15`,
              }}
            >
              #{tag.name || tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
        <Clock size={11} style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {formatDate(note.updatedAt)}
        </span>
      </div>
    </div>

    {/* Quick Preview Modal */}
    <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Quick Preview" width={600}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: 'var(--color-text-primary)' }}>{note.title}</h2>
        
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> {formatDate(note.createdAt)}</div>
          {note.tags?.length > 0 && <div>{note.tags.length} Tags</div>}
        </div>

        <div style={{ background: 'var(--color-surface-2)', padding: 16, borderRadius: 12, fontSize: 14, maxHeight: 150, overflow: 'hidden', position: 'relative' }}>
          <MarkdownRenderer content={note.content} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, var(--color-surface-2))' }} />
        </div>

        {note.aiSummary && (
          <div style={{ background: 'var(--color-primary-glow)', padding: 16, borderRadius: 12, border: '1px solid rgba(124,111,255,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={12}/> AI SUMMARY</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{note.aiSummary}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate(`/resource/note/${note._id}`)}>
            <ExternalLink size={16} /> Open Full Resource
          </button>
          {!note.aiSummary && (
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
