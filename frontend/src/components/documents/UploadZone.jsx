// src/components/documents/UploadZone.jsx
// Drag-and-drop file upload component.
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadDocument } from '../../api/documents.api';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadZone({ defaultRepositoryId }) {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error
  const fileInputRef = useRef();

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadDocument(formData),
    onSuccess: () => {
      setStatus('success');
      toast.success('Document uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (defaultRepositoryId) {
        queryClient.invalidateQueries({ queryKey: ['documents', { repository: defaultRepositoryId }] });
      }
      setTimeout(() => {
        setSelectedFile(null);
        setDocName('');
        setStatus('idle');
      }, 2500);
    },
    onError: () => {
      setStatus('error');
      toast.error('Upload failed. Please try again.');
    },
  });

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name.replace(/\.(pdf|txt)$/i, ''));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name.replace(/\.(pdf|txt)$/i, ''));
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', docName || selectedFile.name);
    if (defaultRepositoryId) {
      formData.append('repository', defaultRepositoryId);
    }
    setStatus('idle');
    uploadMutation.mutate(formData);
  };

  const fileSizeMB = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drop Zone */}
      <div
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
          borderRadius: 14,
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'var(--color-primary-glow)' : 'var(--color-surface-2)',
          transition: 'all 0.2s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}
      >
        <div
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--color-surface-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDragging ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }}
        >
          <Upload size={24} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Drop your file here, or <span style={{ color: 'var(--color-primary)' }}>browse</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Supports PDF and TXT files up to 10MB
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div
          className="glass-card"
          style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-glow)',
              border: '1px solid rgba(124,111,255,0.3)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}
          >
            <FileText size={18} style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              className="input"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Document name..."
              style={{ marginBottom: 4 }}
            />
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {selectedFile.name} · {fileSizeMB} MB
            </div>
          </div>
          <button
            className="btn-ghost"
            style={{ padding: '5px 7px', flexShrink: 0 }}
            onClick={() => { setSelectedFile(null); setDocName(''); }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Status Messages */}
      {status === 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-emerald)', fontSize: 14, fontWeight: 500 }}>
          <CheckCircle size={16} />
          Document uploaded successfully.
        </div>
      )}
      {status === 'error' && (
        <div style={{ color: 'var(--color-rose)', fontSize: 14 }}>
          Upload failed. Please try again.
        </div>
      )}

      {selectedFile && status !== 'success' && (
        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          style={{ alignSelf: 'flex-start' }}
        >
          <Upload size={16} />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
        </button>
      )}
    </div>
  );
}
