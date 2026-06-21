// src/components/ui/AIActionsPanel.jsx
import { Zap, Tag, MessageSquare, CheckCircle, CircleDashed } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateNoteSummary, generateNoteTags } from '../../api/notes.api';
import { generateDocumentSummary, generateDocumentTags } from '../../api/documents.api';

export default function AIActionsPanel({ resource, type }) {
  const queryClient = useQueryClient();
  const isDocument = type === 'document';
  
  const generateSummaryMutation = useMutation({
    mutationFn: () => isDocument ? generateDocumentSummary(resource._id) : generateNoteSummary(resource._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isDocument ? 'documents' : 'notes'] });
      queryClient.invalidateQueries({ queryKey: [type, resource._id] });
    },
  });

  const generateTagsMutation = useMutation({
    mutationFn: () => isDocument ? generateDocumentTags(resource._id) : generateNoteTags(resource._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isDocument ? 'documents' : 'notes'] });
      queryClient.invalidateQueries({ queryKey: [type, resource._id] });
    },
  });

  const hasSummary = !!resource.aiSummary;
  const hasTags = resource.tags && resource.tags.length > 0;
  
  // Quick status helper
  const StatusItem = ({ label, isReady }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isReady ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
        {isReady ? <CheckCircle size={14} /> : <CircleDashed size={14} />}
        {isReady ? 'Ready' : 'Not Generated'}
      </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)' }}>AI Intelligence</h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>On-demand processing to minimize token usage.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <StatusItem label="Embeddings" isReady={true} />
        <StatusItem label="Summary" isReady={hasSummary} />
        <StatusItem label="AI Tags" isReady={hasTags} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!hasSummary && (
          <button 
            className="btn-primary" 
            onClick={() => generateSummaryMutation.mutate()}
            disabled={generateSummaryMutation.isPending}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Zap size={16} /> {generateSummaryMutation.isPending ? 'Generating...' : 'Generate Summary'}
          </button>
        )}
        
        {!hasTags && (
          <button 
            className="btn-primary" 
            onClick={() => generateTagsMutation.mutate()}
            disabled={generateTagsMutation.isPending}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Tag size={16} /> {generateTagsMutation.isPending ? 'Generating...' : 'Generate Tags'}
          </button>
        )}

        <button 
          className="btn-ghost" 
          onClick={() => alert('Ask Vault specific to this resource coming soon!')}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <MessageSquare size={16} /> Ask About This Resource
        </button>
      </div>
    </div>
  );
}
