// src/pages/Dashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/ai.api';
import { getRepositories } from '../api/repositories.api';
import { useAuth } from '../context/AuthContext';
import * as Icons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/ui/Skeleton';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardStats().then((r) => r.data.data),
  });

  const { data: reposData, isLoading: isReposLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => getRepositories().then((r) => r.data.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statsCards = [
    { label: 'Total Notes', value: data?.counts?.notes ?? 0, icon: Icons.FileText, color: 'var(--color-primary-dark)', bg: 'var(--color-primary-glow)' },
    { label: 'Documents',   value: data?.counts?.documents ?? 0, icon: Icons.Upload, color: 'var(--color-accent)', bg: 'rgba(56, 189, 248, 0.1)' },
    { label: 'Tags',        value: data?.counts?.tags ?? 0, icon: Icons.Zap, color: 'var(--color-warning)', bg: 'rgba(250, 204, 21, 0.1)' },
  ];

  return (
    <div style={{ padding: 'var(--page-padding)', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
          {greeting()}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }}>
          Your knowledge vault is ready.
        </p>
      </div>

      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {isLoading ? [1, 2, 3].map(k => <Skeleton key={k} height={80} />) : (
          <>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}>
                <Icons.FileText size={16} /> Total Notes
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{data?.counts?.notes ?? 0}</div>
            </div>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}>
                <Icons.Upload size={16} /> Documents
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{data?.counts?.documents ?? 0}</div>
            </div>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--color-surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}>
                <Icons.Folder size={16} /> Research Spaces
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{reposData?.length ?? 0}</div>
            </div>
          </>
        )}
      </div>

      {/* Daily Vault Section */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Icons.Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>Daily Vault</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Continue Researching</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Pick up where you left off. Review your most recently added documents and notes.</div>
            <Link to="/search" className="btn-ghost" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>Browse Recent <Icons.ArrowRight size={14} /></Link>
          </div>
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rediscover</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Revisit older knowledge. We found 3 resources you haven't looked at in months.</div>
            <Link to="/search" className="btn-ghost" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>Review Items <Icons.ArrowRight size={14} /></Link>
          </div>
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}><Icons.BrainCircuit size={14} /> AI Assistant</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Ask your vault questions and let AI synthesize answers from your knowledge.</div>
            <Link to="/ask" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'auto', padding: '6px 14px', fontSize: 13 }}>Ask Vault AI <Icons.Zap size={14} /></Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        {/* Left Column: Recent Activity */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Icons.Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Activity</h2>
          </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map((k) => <Skeleton key={k} height={64} />)}
          </div>
        ) : data?.recentActivity?.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <Icons.TrendingUp size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px', display: 'block' }} />
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
              <Link
                to={`/resource/${item.type}/${item._id}`}
                key={item._id}
                className="glass-card"
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
              >
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: 'var(--color-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {item.type === 'note' ? <Icons.FileText size={16} /> : <Icons.BookOpen size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title || item.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {item.type === 'note' ? 'Note' : 'Document'} · {formatDate(item.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>

        {/* Right Column: Quick Search & Repositories */}
        <div style={{ flex: '1 1 340px', minWidth: 300, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Quick Search */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icons.Search size={16} style={{ color: 'var(--color-text-muted)' }} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Quick Search</h2>
            </div>
            <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'text' }} onClick={() => navigate('/search')}>
              <Icons.Search size={16} color="var(--color-text-muted)" />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Search your vault...</span>
              <div style={{ marginLeft: 'auto', background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: 6, fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>⌘K</div>
            </div>
          </div>

          {/* Recent Repositories */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Folder size={16} style={{ color: 'var(--color-text-muted)' }} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Repositories</h2>
              </div>
              <Link to="/repositories" style={{ fontSize: 13, color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <Icons.ArrowRight size={12} />
              </Link>
            </div>

            {isReposLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2].map((k) => <Skeleton key={k} height={80} />)}
              </div>
            ) : reposData?.length === 0 ? (
              <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 14 }}>No research spaces yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reposData?.slice(0, 3).map((repo) => {
                  const Icon = Icons[repo.icon] || Icons.Folder;
                  return (
                  <Link
                    key={repo._id}
                    to={`/repo/${repo._id}`}
                    className="glass-card"
                    style={{ display: 'block', textDecoration: 'none', overflow: 'hidden' }}
                  >
                    <div style={{ height: 40, background: repo.coverImage || 'var(--color-surface-2)' }} />
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Icon size={16} style={{ color: `var(--color-${repo.themeColor})` || 'var(--color-primary)' }} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {repo.name}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{repo.resourceCount || 0} resources</span>
                        <span>{repo.lastActivity ? new Date(repo.lastActivity).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </Link>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
