import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Button } from '../ui/Button'

export function Topbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-surface/80 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">RupeeRocket</p>
        <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Button>
        <div className="rounded-2xl border border-border bg-surfaceAlt px-4 py-2 text-sm text-muted">
          {user?.email || 'Signed in'}
        </div>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}