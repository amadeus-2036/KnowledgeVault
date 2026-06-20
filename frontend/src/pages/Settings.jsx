// src/pages/Settings.jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateMe } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Database, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user, login, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => updateMe({ name }),
    onSuccess: (res) => {
      login(res.data.data, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => setError(err.response?.data?.message || 'Update failed'),
  });

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'KV';

  return (
    <div style={{ padding: '36px 40px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <User size={16} style={{ color: 'var(--color-primary-light)' }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Profile</h2>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: 'white',
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Display Name
            </label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Email cannot be changed</div>
          </div>

          {error && <div style={{ color: 'var(--color-rose)', fontSize: 13 }}>{error}</div>}
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-emerald)', fontSize: 14, fontWeight: 500 }}>
              <CheckCircle size={16} /> Profile updated!
            </div>
          )}

          <button
            className="btn-primary"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield size={16} style={{ color: 'var(--color-accent)' }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Security</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Authentication', value: 'JWT (JSON Web Token)' },
            { label: 'Token expiry', value: '7 days' },
            { label: 'Password storage', value: 'bcrypt (12 rounds)' },
            { label: 'Data access', value: 'User-scoped (complete isolation)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Database size={16} style={{ color: 'var(--color-amber)' }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Tech Stack</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['React', 'Vite', 'Tailwind CSS', 'React Query', 'Node.js', 'Express.js', 'MongoDB Atlas', 'Mongoose', 'JWT', 'Gemini AI', 'Vector Search', 'Multer'].map((tech) => (
            <span
              key={tech}
              style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
