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
          width: 64, height: 64, borderRadius: 20,
          background: 'var(--color-primary-glow)',
          border: '1px solid rgba(var(--color-primary-rgb), 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary-light)',
          marginBottom: 16,
        }}
      >
        {Icon && <Icon size={28} />}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
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
