// src/components/notes/NoteEditor.jsx
// Modal-based note create/edit form.
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNote, updateNote } from '../../api/notes.api';
import { getTags, createTag } from '../../api/tags.api';
import Modal from '../ui/Modal';
import { Plus, X, Tag } from 'lucide-react';

export default function NoteEditor({ note, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!note;

  const [form, setForm] = useState({ title: '', content: '' });
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags().then((r) => r.data.data),
  });
  const tags = tagsData || [];

  // Populate form when editing
  useEffect(() => {
    if (note) {
      setForm({ title: note.title, content: note.content });
      setSelectedTagIds(note.tags?.map((t) => t._id) || []);
    } else {
      setForm({ title: '', content: '' });
      setSelectedTagIds([]);
    }
    setError('');
  }, [note, isOpen]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? updateNote(note._id, data) : createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to save'),
  });

  const createTagMutation = useMutation({
    mutationFn: (data) => createTag(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setSelectedTagIds((prev) => [...prev, res.data.data._id]);
      setNewTagName('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required');
      return;
    }
    saveMutation.mutate({ ...form, tags: selectedTagIds });
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Note' : 'New Note'} width={640}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Title
          </label>
          <input
            className="input"
            placeholder="Note title..."
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Content
          </label>
          <textarea
            className="textarea"
            placeholder="Write your note here... (AI will auto-generate tags and summary)"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            style={{ minHeight: 200 }}
          />
        </div>

        {/* Tags */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Tag size={12} /> Tags
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {tags.map((tag) => (
              <button
                type="button"
                key={tag._id}
                onClick={() => toggleTag(tag._id)}
                className="tag-pill"
                style={{
                  cursor: 'pointer',
                  color: selectedTagIds.includes(tag._id) ? tag.color || '#7c6fff' : 'var(--color-text-muted)',
                  borderColor: selectedTagIds.includes(tag._id) ? `${tag.color || '#7c6fff'}60` : 'var(--color-border)',
                  background: selectedTagIds.includes(tag._id) ? `${tag.color || '#7c6fff'}20` : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                #{tag.name}
                {selectedTagIds.includes(tag._id) && <X size={10} />}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Add new tag..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newTagName.trim()) createTagMutation.mutate({ name: newTagName });
                }
              }}
            />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { if (newTagName.trim()) createTagMutation.mutate({ name: newTagName }); }}
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--color-rose)', fontSize: 13, background: 'rgba(244,63,94,0.1)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.2)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
