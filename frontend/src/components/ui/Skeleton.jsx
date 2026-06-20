// src/components/ui/Skeleton.jsx
export function Skeleton({ width = '100%', height = 20, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 8, ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Skeleton width="60%" height={20} />
        <Skeleton width={60} height={22} style={{ borderRadius: 99 }} />
      </div>
      <Skeleton height={14} />
      <Skeleton width="80%" height={14} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Skeleton width={50} height={20} style={{ borderRadius: 99 }} />
        <Skeleton width={60} height={20} style={{ borderRadius: 99 }} />
      </div>
    </div>
  );
}
