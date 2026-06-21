// src/pages/Documents.jsx
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '../api/documents.api';
import DocumentCard from '../components/documents/DocumentCard';
import UploadZone from '../components/documents/UploadZone';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Upload } from 'lucide-react';
import { useState } from 'react';

import { motion } from 'framer-motion';

export default function Documents() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page],
    queryFn: () => getDocuments({ page, limit: 12 }).then((r) => r.data.data),
    keepPreviousData: true,
    refetchInterval: 3000, // Auto-poll every 3 seconds to catch AI completion
  });

  const docs = data?.documents || [];
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
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Documents</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Upload PDFs and TXT files — AI will extract, summarize, and index them
        </p>
      </div>

      {/* Upload Zone */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Upload size={16} style={{ color: 'var(--color-accent)' }} /> Upload a Document
        </h2>
        <UploadZone />
      </div>

      {/* Document Grid */}
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>
        Your Documents {pagination?.total != null && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: 14 }}>({pagination.total})</span>}
      </h2>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map((k) => <CardSkeleton key={k} />)}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No documents yet"
          description="Upload a PDF or TXT file above. AI will automatically extract text, generate a summary, and create searchable tags."
        />
      ) : (
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}
        >
          {docs.map((doc) => (
            <motion.div key={doc._id} variants={item}>
              <DocumentCard doc={doc} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          <button className="btn-ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button className="btn-ghost" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
