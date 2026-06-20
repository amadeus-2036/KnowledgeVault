import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import NoteEditor from '../notes/NoteEditor';
import UploadZone from '../documents/UploadZone';
import { FileText, Upload, Link as LinkIcon } from 'lucide-react';
import { ingestUrl } from '../../api/knowledge.api';
import toast from 'react-hot-toast';

export default function AddKnowledgeModal({ isOpen, onClose, defaultRepositoryId }) {
  const [activeTab, setActiveTab] = useState('note'); // 'note', 'upload', 'url'
  const [url, setUrl] = useState('');
  const queryClient = useQueryClient();

  const ingestMutation = useMutation({
    mutationFn: (data) => ingestUrl(data),
    onSuccess: () => {
      toast.success('URL ingested! AI is processing in the background.');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (defaultRepositoryId) {
        queryClient.invalidateQueries({ queryKey: ['notes', { repository: defaultRepositoryId }] });
      }
      setUrl('');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to ingest URL');
    }
  });

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    ingestMutation.mutate({ url, repository: defaultRepositoryId });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Knowledge to Vault" width={640}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
        <button
          onClick={() => setActiveTab('note')}
          style={{
            flex: 1, padding: '10px', borderRadius: 8, border: 'none',
            background: activeTab === 'note' ? 'var(--color-primary-glow)' : 'transparent',
            color: activeTab === 'note' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'note' ? 700 : 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <FileText size={18} /> Write Note
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            flex: 1, padding: '10px', borderRadius: 8, border: 'none',
            background: activeTab === 'upload' ? 'var(--color-accent-glow)' : 'transparent',
            color: activeTab === 'upload' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'upload' ? 700 : 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <Upload size={18} /> Upload PDF/TXT
        </button>
        <button
          onClick={() => setActiveTab('url')}
          style={{
            flex: 1, padding: '10px', borderRadius: 8, border: 'none',
            background: activeTab === 'url' ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
            color: activeTab === 'url' ? '#ec4899' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'url' ? 700 : 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <LinkIcon size={18} /> Paste URL
        </button>
      </div>

      <div>
        {activeTab === 'note' && (
          <NoteEditor
            isOpen={true} // It's already inside a modal, but NoteEditor renders its own Modal. Wait, this is a problem!
            onClose={onClose}
            defaultRepositoryId={defaultRepositoryId}
          />
        )}

        {activeTab === 'upload' && (
          <UploadZone defaultRepositoryId={defaultRepositoryId} />
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--color-surface-2)', padding: 16, borderRadius: 12, border: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Supported URL Sources</h3>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li><strong>Articles & Blogs</strong> (Medium, Dev.to, etc.)</li>
                <li><strong>YouTube Videos</strong> (Extracts transcripts)</li>
                <li><strong>GitHub Repositories</strong> (Extracts README)</li>
              </ul>
            </div>
            
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Source URL
              </label>
              <input
                className="input"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={ingestMutation.isPending || !url.trim()}>
                {ingestMutation.isPending ? 'Processing...' : 'Ingest URL & AI Process'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
