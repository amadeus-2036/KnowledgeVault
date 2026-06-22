// src/pages/ResourceDetails.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNoteById } from '../api/notes.api';
import { getDocumentById } from '../api/documents.api';
import { ArrowLeft, Clock, Zap, FileText, ExternalLink } from 'lucide-react';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import AIActionsPanel from '../components/ui/AIActionsPanel';
import { Skeleton } from '../components/ui/Skeleton';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function ResourceDetails() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const isDocument = type === 'document';

  const { data: resourceResponse, isLoading, isError } = useQuery({
    queryKey: [isDocument ? 'document' : 'note', id],
    queryFn: () => isDocument ? getDocumentById(id).then(r => r.data) : getNoteById(id).then(r => r.data),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
        <Skeleton width={120} height={20} style={{ marginBottom: 30 }} />
        <Skeleton width="60%" height={40} style={{ marginBottom: 20 }} />
        <Skeleton width="100%" height={300} />
      </div>
    );
  }

  if (isError || !resourceResponse?.data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Resource not found</h2>
        <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const resource = resourceResponse.data;
  const title = isDocument ? resource.name : resource.title;
  const content = isDocument ? resource.extractedText : resource.content;

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const fileName = filePath.replace(/\\/g, '/').split('/').pop();
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    return `${baseUrl}/uploads/${fileName}`;
  };

  const extractUrlFromNote = (noteContent) => {
    if (!noteContent) return null;
    const lines = noteContent.split('\n');
    if (lines[0].startsWith('http')) return lines[0].trim();
    return null;
  };

  const sourceUrl = !isDocument ? extractUrlFromNote(content) : null;

  return (
    <div style={{ padding: 'var(--page-padding)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 30 }}>
      {/* Header */}
      <div>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: '6px 12px', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ margin: 0, fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', lineHeight: 1.2, maxWidth: '24ch' }}>
          {title}
        </h1>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 14, color: 'var(--color-text-muted)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {formatDate(resource.createdAt)}</div>
          {isDocument && <div>{resource.fileType?.toUpperCase()} Document</div>}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Main Content (Left) */}
        <div style={{ flex: '1 1 60%', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* AI Summary Block */}
          {resource.aiSummary && (
            <div style={{ background: 'var(--color-primary-glow)', padding: 24, borderRadius: 16, border: '1px solid var(--color-primary-light)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Zap size={16}/> Generated Summary
              </div>
              <div style={{ fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                <MarkdownRenderer content={resource.aiSummary} />
              </div>
            </div>
          )}

          {/* Actual Content / Original Resource */}
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
              <FileText size={16}/> {isDocument && resource.fileType === 'pdf' ? 'Original PDF' : 'Content'}
            </div>
            
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', padding: '12px', width: '100%' }}>
                <ExternalLink size={16} /> Open Original Link
              </a>
            )}

            <div className="note-content" style={{ maxWidth: '65ch', margin: '0 auto', fontSize: 17, lineHeight: 1.85, color: 'var(--color-text-primary)' }}>
              {isDocument && resource.fileType === 'pdf' ? (
                <iframe src={getFileUrl(resource.filePath)} width="100%" height="800px" style={{ border: '1px solid var(--color-border)', borderRadius: '12px' }} title="PDF Viewer" />
              ) : isDocument ? (
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-primary)' }}>{content}</div>
              ) : (
                <MarkdownRenderer content={content} />
              )}
            </div>
          </div>
        </div>

        {/* AI Actions Sidebar (Right) */}
        <div style={{ flex: '0 0 320px', position: 'sticky', top: 40 }}>
          <AIActionsPanel resource={resource} type={type} />
        </div>

      </div>
    </div>
  );
}
