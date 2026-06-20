import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRepository } from '../api/repositories.api';
import { getNotes } from '../api/notes.api';
import { getDocuments } from '../api/documents.api';
import { Skeleton } from '../components/ui/Skeleton';
import { FileText, Upload, Clock } from 'lucide-react';
import NoteCard from '../components/notes/NoteCard';
import DocumentCard from '../components/documents/DocumentCard';
import { useState } from 'react';
import Modal from '../components/ui/Modal';
import AddKnowledgeModal from '../components/ui/AddKnowledgeModal';
import NoteEditor from '../components/notes/NoteEditor';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function RepositoryDashboard() {
  const { id } = useParams();

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const { data: repo, isLoading: repoLoading } = useQuery({
    queryKey: ['repository', id],
    queryFn: () => getRepository(id),
  });

  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', { repository: id }],
    queryFn: () => getNotes({ repository: id }).then(r => r.data),
  });

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ['documents', { repository: id }],
    queryFn: () => getDocuments({ repository: id }).then(r => r.data),
  });

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  if (repoLoading) return <div style={{ padding: 40 }}><Skeleton height={200} /></div>;

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: `var(--color-${repo?.themeColor || 'primary'})` }} />
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {repo?.name}
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 15 }}>
            {repo?.description || 'No description provided.'}
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreateNote}>
          + Add Note
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Notes Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Notes</h2>
          </div>
          {notesLoading ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
               <Skeleton height={200} />
               <Skeleton height={200} />
             </div>
          ) : notesData?.data?.notes?.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No notes in this repository yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {notesData?.data?.notes?.map(note => (
                <NoteCard key={note._id} note={note} onEdit={handleEditNote} />
              ))}
            </div>
          )}
        </section>

        {/* Documents Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Upload size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Documents</h2>
          </div>
          {docsLoading ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
               <Skeleton height={200} />
             </div>
          ) : docsData?.data?.documents?.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No documents in this repository yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {docsData?.data?.documents?.map(doc => (
                <DocumentCard key={doc._id} doc={doc} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Note Editor Modal for editing existing notes */}
      <Modal isOpen={isNoteModalOpen && editingNote} onClose={() => setIsNoteModalOpen(false)} title="Edit Note" width={640}>
        <NoteEditor
          note={editingNote}
          onClose={() => setIsNoteModalOpen(false)}
          defaultRepositoryId={id}
        />
      </Modal>

      {/* Universal Add Knowledge Modal for new items */}
      <AddKnowledgeModal
        isOpen={isNoteModalOpen && !editingNote}
        onClose={() => setIsNoteModalOpen(false)}
        defaultRepositoryId={id}
      />

    </div>
  );
}
