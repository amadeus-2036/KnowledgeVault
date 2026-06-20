// src/pages/Dashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/ai.api';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Zap, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../components/ui/Skeleton';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardStats().then((r) => r.data.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statsCards = [
    { label: 'Total Notes', value: data?.counts?.notes ?? 0, icon: FileText, color: 'var(--color-primary-dark)', bg: 'var(--color-primary-glow)' },
    { label: 'Documents',   value: data?.counts?.documents ?? 0, icon: Upload, color: 'var(--color-accent)', bg: 'var(--color-accent-glow)' },
  ];

  // Generate some mock data for the growth chart to look premium
  const chartData = [
    { name: 'Mon', items: 2 },
    { name: 'Tue', items: 3 },
    { name: 'Wed', items: 5 },
    { name: 'Thu', items: 8 },
    { name: 'Fri', items: 12 },
    { name: 'Sat', items: (data?.counts?.notes || 0) + (data?.counts?.documents || 0) + 14 },
  ];

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {greeting()},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Here's what's in your knowledge vault
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {isLoading
          ? [1, 2].map((k) => <Skeleton key={k} height={110} />)
          : statsCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                  {value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            </div>
          ))}

        {/* Ask Vault CTA */}
        <div
          className="glass-card"
          style={{
            padding: 22, background: 'linear-gradient(135deg, rgba(124,111,255,0.1), rgba(6,194,168,0.1))',
            border: '1px solid rgba(124,111,255,0.25)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={22} color="var(--color-primary-content)" />
          </div>
          <div>
            <Link to="/ask" style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none' }}>
              Ask My Vault
            </Link>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Query your knowledge with AI
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Growth Chart */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={16} style={{ color: 'var(--color-text-muted)' }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Knowledge Growth</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px 24px 10px 10px', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-strong)', borderRadius: 10 }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Area type="monotone" dataKey="items" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorItems)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Activity</h2>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map((k) => <Skeleton key={k} height={64} />)}
          </div>
        ) : data?.recentActivity?.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <TrendingUp size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              No activity yet.{' '}
              <Link to="/notes" style={{ color: 'var(--color-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                Create your first note →
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data?.recentActivity?.map((item) => (
              <div
                key={item._id}
                className="glass-card"
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: item.type === 'note' ? 'var(--color-primary-glow)' : 'var(--color-accent-glow)',
                    border: `1px solid ${item.type === 'note' ? 'rgba(124,111,255,0.3)' : 'rgba(6,194,168,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.type === 'note' ? 'var(--color-primary-light)' : 'var(--color-accent)',
                  }}
                >
                  {item.type === 'note' ? <FileText size={16} /> : <Upload size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title || item.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {item.type === 'note' ? 'Note' : 'Document'} · {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
