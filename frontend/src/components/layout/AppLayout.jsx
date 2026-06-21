// src/components/layout/AppLayout.jsx
// Wraps all authenticated pages with the sidebar + main content area.
import Sidebar from './Sidebar';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Search, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import AddKnowledgeModal from '../ui/AddKnowledgeModal';

export default function AppLayout() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main
        style={{
          flex: 1,
          background: 'var(--color-surface-0)',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100vh',
          paddingBottom: 'var(--mobile-nav-height)',
        }}
      >
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `mobile-bottom-nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `mobile-bottom-nav-link ${isActive ? 'active' : ''}`}>
          <Search size={20} />
          <span>Search</span>
        </NavLink>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-primary-content)',
            width: 46, height: 46, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', transform: 'translateY(-12px)',
            boxShadow: '0 4px 16px var(--color-primary-glow)',
          }}
        >
          <Plus size={24} />
        </button>
        <NavLink to="/notes" className={({ isActive }) => `mobile-bottom-nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Notes</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `mobile-bottom-nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <AddKnowledgeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
