import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ToastViewport } from './components/ui/ToastViewport'
import { GuestRoute, ProtectedRoute } from './routes/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { AddTransactionPage } from './pages/dashboard/AddTransactionPage'
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage'
import { ReceiptScannerPage } from './pages/dashboard/ReceiptScannerPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <>
      <ToastViewport />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions/new" element={<AddTransactionPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/receipts" element={<ReceiptScannerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}