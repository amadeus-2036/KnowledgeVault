// src/pages/Notes.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotes } from '../api/notes.api';
import NoteCard from '../components/notes/NoteCard';
import NoteEditor from '../components/notes/NoteEditor';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Plus, FileText, Search, Pin } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import { motion } from 'framer-motion';

export default function Notes() {
  const [editorState, setEditorState] = useState({ isOpen: false, note: null });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pinFilter, setPinFilter] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['notes', page, debouncedSearch, pinFilter],
    queryFn: () =>
      getNotes({ page, limit: 12, search: debouncedSearch || undefined, pinned: pinFilter || undefined }).then((r) => r.data.data),
    keepPreviousData: true,
    refetchInterval: 3000,
  });

  const notes = data?.notes || [];
  const pagination = data?.pagination;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div style={{ padding: 'var(--page-padding)', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Notes</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
            {pagination?.total ?? 0} notes in your vault
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setEditorState({ isOpen: true, note: null })}
          id="create-note-btn"
        >
          <Plus size={17} /> New Note
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button
          className={pinFilter ? 'btn-primary' : 'btn-ghost'}
          onClick={() => { setPinFilter(!pinFilter); setPage(1); }}
          style={{ padding: '8px 14px' }}
        >
          <Pin size={14} /> Pinned
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map((k) => <CardSkeleton key={k} />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description={search ? `No notes matching "${search}"` : 'Create your first note and let AI generate summaries and tags automatically.'}
          action={
            !search && (
              <button className="btn-primary" onClick={() => setEditorState({ isOpen: true, note: null })}>
                <Plus size={16} /> Create Note
              </button>
            )
          }
        />
      ) : (
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}
        >
          {notes.map((note) => (
            <motion.div key={note._id} variants={item}>
              <NoteCard
                note={note}
                onEdit={(n) => setEditorState({ isOpen: true, note: n })}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          <button className="btn-ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button className="btn-ghost" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* Note Editor Modal */}
      <Modal isOpen={editorState.isOpen} onClose={() => setEditorState({ isOpen: false, note: null })} title={editorState.note ? 'Edit Note' : 'New Note'} width={640}>
        <NoteEditor
          isOpen={editorState.isOpen}
          note={editorState.note}
          onClose={() => setEditorState({ isOpen: false, note: null })}
        />
      </Modal>
    </div>
  );
}
