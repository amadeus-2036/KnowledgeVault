// src/components/ui/Modal.jsx
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, width = 560 }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '4px 6px', cursor: 'pointer',
                color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
