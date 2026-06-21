// src/App.jsx
// Root router — defines all page routes and protects authenticated routes.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './router/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Documents from './pages/Documents';
import Search from './pages/Search';
import AskVault from './pages/AskVault';
import Settings from './pages/Settings';
import RepositoryDashboard from './pages/RepositoryDashboard';
import ResourceDetails from './pages/ResourceDetails';
import Pomodoro from './pages/Pomodoro';

// React Query client configuration
// Interview point: staleTime means we don't refetch if data is less than 1 min old.
// This prevents unnecessary API calls when navigating between pages.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — wrapped in AppLayout (sidebar + main area) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/search" element={<Search />} />
              <Route path="/ask" element={<AskVault />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/repo/:id" element={<RepositoryDashboard />} />
              <Route path="/resource/:type/:id" element={<ResourceDetails />} />
              <Route path="/focus" element={<Pomodoro />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" className="toaster-override" />
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
