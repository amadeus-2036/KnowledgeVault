// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, Search, MessageSquare,
  Settings, Zap, LogOut, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getRepositories } from '../../api/repositories.api';
import AddKnowledgeModal from '../ui/AddKnowledgeModal';
import CreateVaultModal from '../ui/CreateVaultModal';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes',     icon: FileText,        label: 'Global Notes' },
  { to: '/documents', icon: Upload,           label: 'Global Documents' },
  { to: '/search',    icon: Search,           label: 'Global Search' },
  { to: '/ask',       icon: MessageSquare,    label: 'Ask Vault AI' },
  { to: '/settings',  icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false);

  const { data: repositories = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: getRepositories,
  });

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
          <Zap size={18} color="var(--color-primary-content)" fill="var(--color-primary-content)" />
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

      {/* Add Knowledge Button */}
      <div style={{ padding: '0 8px 16px' }}>
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} /> Add Knowledge
        </button>
      </div>

      <AddKnowledgeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {label === 'Ask Vault AI' && (
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

      {/* Repositories Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
        <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            My Vaults
          </div>
          <button
            className="btn-ghost"
            style={{ padding: 4 }}
            onClick={() => setIsCreateVaultModalOpen(true)}
            title="Create Vault"
          >
            <Plus size={14} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {repositories.map(repo => (
            <NavLink
              key={repo._id}
              to={`/repo/${repo._id}`}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              style={{ paddingLeft: 24 }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--color-${repo.themeColor || 'primary'})` }} />
              <span>{repo.name}</span>
            </NavLink>
          ))}
          {repositories.length === 0 && (
            <div style={{ padding: '8px 24px', fontSize: 13, color: 'var(--color-text-muted)' }}>
              No vaults yet. Click + to create.
            </div>
          )}
        </div>
      </div>

      <CreateVaultModal
        isOpen={isCreateVaultModalOpen}
        onClose={() => setIsCreateVaultModalOpen(false)}
      />

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
              fontSize: 13, fontWeight: 700, color: 'var(--color-primary-content)', flexShrink: 0,
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
