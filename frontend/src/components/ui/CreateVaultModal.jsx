import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import { createRepository } from '../../api/repositories.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const VAULT_COLORS = ['blue', 'purple', 'emerald', 'rose', 'amber', 'indigo', 'teal'];

export default function CreateVaultModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', themeColor: 'blue' });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data) => createRepository(data),
    onSuccess: (newVault) => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      toast.success('Vault created successfully!');
      setForm({ name: '', description: '', themeColor: 'blue' });
      onClose();
      navigate(`/repo/${newVault._id}`);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create vault');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Vault name is required');
      return;
    }
    setError('');
    mutation.mutate(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Vault" width={500}>
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

        {error && (
          <div style={{ color: 'var(--color-rose)', fontSize: 13, background: 'rgba(244,63,94,0.1)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.2)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Vault'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
