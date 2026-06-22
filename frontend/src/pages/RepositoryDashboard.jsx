import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRepository } from '../api/repositories.api';
import { getNotes } from '../api/notes.api';
import { getDocuments } from '../api/documents.api';
import { Skeleton } from '../components/ui/Skeleton';
import * as Icons from 'lucide-react';
import NoteCard from '../components/notes/NoteCard';
import DocumentCard from '../components/documents/DocumentCard';
import { useState } from 'react';
import Modal from '../components/ui/Modal';
import AddKnowledgeModal from '../components/ui/AddKnowledgeModal';
import NoteEditor from '../components/notes/NoteEditor';
import EditVaultModal from '../components/ui/EditVaultModal';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function RepositoryDashboard() {
  const { id } = useParams();

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isEditVaultModalOpen, setIsEditVaultModalOpen] = useState(false);

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

  const RepoIcon = repo?.icon && Icons[repo.icon] ? Icons[repo.icon] : Icons.Folder;

  return (
    <div style={{ paddingBottom: 'var(--page-padding)', width: '100%' }}>
      {/* Cover Image */}
      <div 
        style={{ 
          height: 240, 
          background: repo?.coverImage || `linear-gradient(135deg, var(--color-${repo?.themeColor || 'primary'}) 0%, var(--color-surface-2) 100%)`,
          width: '100%',
          position: 'relative'
        }} 
      />
      
      <div style={{ padding: '0 var(--page-padding)', maxWidth: 1100, margin: '0 auto', marginTop: -48, position: 'relative', zIndex: 10 }}>
        {/* Header Content */}
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div 
              className="glass-card" 
              style={{ 
                width: 80, height: 80, borderRadius: 20, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                background: 'var(--color-surface-1)', marginBottom: 16,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}
            >
              <RepoIcon size={40} style={{ color: `var(--color-${repo?.themeColor || 'primary'})` }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              {repo?.name}
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--color-text-secondary)', fontSize: 16, maxWidth: 600 }}>
              {repo?.description || 'No description provided.'}
            </p>
            
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600 }}>
                <Icons.FileText size={16} /> {notesData?.data?.notes?.length || 0} Notes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600 }}>
                <Icons.Upload size={16} /> {docsData?.data?.documents?.length || 0} Documents
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600 }}>
                <Icons.Clock size={16} /> Updated {repo?.updatedAt ? formatDate(repo.updatedAt) : 'Recently'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="btn-ghost" onClick={() => setIsEditVaultModalOpen(true)}>
              <Icons.Settings size={18} /> Edit Vault
            </button>
            <button 
              className="btn-primary" 
              onClick={handleCreateNote}
              style={{ background: `var(--color-${repo?.themeColor || 'primary'})`, borderColor: `var(--color-${repo?.themeColor || 'primary'})`, color: 'var(--color-primary-content)' }}
            >
              <Icons.Plus size={18} /> Add Knowledge
            </button>
          </div>
        </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Notes Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Icons.FileText size={18} style={{ color: `var(--color-${repo?.themeColor || 'primary'})` }} />
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
            <Icons.Upload size={18} style={{ color: `var(--color-${repo?.themeColor || 'primary'})` }} />
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

      {/* Edit Vault Modal */}
      <EditVaultModal 
        isOpen={isEditVaultModalOpen} 
        onClose={() => setIsEditVaultModalOpen(false)} 
        repository={repo} 
      />

      </div>
    </div>
  );
}
