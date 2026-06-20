// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, Search, MessageSquare,
  Settings, Zap, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes',     icon: FileText,        label: 'Notes' },
  { to: '/documents', icon: Upload,           label: 'Documents' },
  { to: '/search',    icon: Search,           label: 'Search' },
  { to: '/ask',       icon: MessageSquare,    label: 'Ask My Vault' },
  { to: '/settings',  icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'KV';

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'var(--color-surface-1)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        gap: 4,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 20px' }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Zap size={18} color="white" fill="white" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            Knowledge
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Vault AI
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {label === 'Ask My Vault' && (
              <span
                style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                AI
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 14,
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={handleLogout} style={{ width: '100%', justifyContent: 'flex-start' }}>
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
