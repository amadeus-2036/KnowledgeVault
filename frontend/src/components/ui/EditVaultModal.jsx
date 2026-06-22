import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import { updateRepository } from '../../api/repositories.api';
import toast from 'react-hot-toast';

const VAULT_COLORS = ['sage', 'matcha', 'lavender', 'dusty_rose', 'peach', 'sky_blue', 'slate_blue', 'terracotta', 'mocha', 'graphite'];

export default function EditVaultModal({ isOpen, onClose, repository }) {
  const [form, setForm] = useState({ name: '', description: '', themeColor: 'sage', coverImage: '' });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (repository) {
      setForm({
        name: repository.name || '',
        description: repository.description || '',
        themeColor: repository.themeColor || 'sage',
        coverImage: repository.coverImage || ''
      });
    }
  }, [repository]);

  const mutation = useMutation({
    mutationFn: (data) => updateRepository(repository._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repository', repository._id] });
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      toast.success('Vault updated successfully!');
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update vault');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Vault name is required');
      return;
    }
    setError('');
    
    // Check if coverImage is an HTTP URL, if so format it properly for CSS background, else pass as is
    let finalCoverImage = form.coverImage;
    if (finalCoverImage && (finalCoverImage.startsWith('http://') || finalCoverImage.startsWith('https://'))) {
      finalCoverImage = `url("${finalCoverImage}") center/cover no-repeat`;
    }

    mutation.mutate({ ...form, coverImage: finalCoverImage });
  };

  // Convert background style back to raw URL for the input field if it's currently formatted as url("...")
  const displayCoverImage = () => {
    if (form.coverImage && form.coverImage.startsWith('url("')) {
      const match = form.coverImage.match(/url\("([^"]+)"\)/);
      if (match && match[1]) return match[1];
    }
    return form.coverImage;
  };

  const handleCoverImageChange = (e) => {
    setForm(f => ({ ...f, coverImage: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Vault" width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vault Name *
          </label>
          <input
            className="input"
            placeholder="e.g., Fitness, Machine Learning..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Description (Optional)
          </label>
          <textarea
            className="textarea"
            placeholder="What is this vault about?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            style={{ minHeight: 80 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Theme Color
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {VAULT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(f => ({ ...f, themeColor: color }))}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: `var(--color-${color})`,
                  border: form.themeColor === color ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s',
                  transform: form.themeColor === color ? 'scale(1.1)' : 'scale(1)'
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cover Image URL (Optional)
          </label>
          <input
            className="input"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={displayCoverImage()}
            onChange={handleCoverImageChange}
          />
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6, marginBottom: 0 }}>
            Paste a link to any image online to customize your vault header. Leave blank to use default.
          </p>
        </div>

        {error && (
           <div style={{ color: 'var(--color-rose)', fontSize: 13, background: 'rgba(244,63,94,0.1)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.2)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
