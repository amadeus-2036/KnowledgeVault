// src/components/layout/AppLayout.jsx
// Wraps all authenticated pages with the sidebar + main content area.
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          background: 'var(--color-surface-0)',
          overflowY: 'auto',
          minHeight: '100vh',
        }}
      >
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
