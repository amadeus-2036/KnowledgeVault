// src/components/notes/NoteCard.jsx
import { Pin, PinOff, Trash2, Edit, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote, togglePin } from '../../api/notes.api';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function NoteCard({ note, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(note._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const pinMutation = useMutation({
    mutationFn: () => togglePin(note._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  return (
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
      onClick={() => onEdit(note)}
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
      <p
        style={{
          margin: 0, fontSize: 13, color: 'var(--color-text-secondary)',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          lineHeight: 1.6,
        }}
      >
        {note.content}
      </p>

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

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {note.tags.map((tag) => (
            <span
              key={tag._id}
              className="tag-pill"
              style={{
                color: tag.color || '#7c6fff',
                borderColor: `${tag.color || '#7c6fff'}40`,
                background: `${tag.color || '#7c6fff'}15`,
              }}
            >
              #{tag.name}
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
  );
}
