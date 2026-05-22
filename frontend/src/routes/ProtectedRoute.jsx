import { Navigate, Outlet } from 'react-router-dom'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingSpinner label="Checking session" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingSpinner label="Loading session" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}