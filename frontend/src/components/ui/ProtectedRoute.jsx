import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingState } from './LoadingState'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="p-6"><LoadingState label="Authenticating" /></div>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="p-6"><LoadingState label="Preparing session" /></div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}