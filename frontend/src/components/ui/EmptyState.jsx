// src/components/ui/EmptyState.jsx
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)',
          marginBottom: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 340, lineHeight: 1.6 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
