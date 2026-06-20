// src/router/ProtectedRoute.jsx
// Interview point: ProtectedRoute uses the auth context to check if user is
// authenticated. If not, it redirects to /login. This keeps auth logic
// centralized — no need to add guards in every page component.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
