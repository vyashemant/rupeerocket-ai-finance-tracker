import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Button } from '../ui/Button'
import { BellIcon, ChevronDownIcon, MenuIcon, MoonIcon, SunIcon, UserIcon, LogoutIcon, SettingsIcon } from '../ui/Icons'

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const firstName = user?.full_name?.split(' ')?.[0] || 'there'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 xl:px-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="rounded-2xl border border-border bg-surfaceAlt p-2 text-text lg:hidden">
            <MenuIcon className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">RupeeRocket</p>
            <h2 className="font-display text-lg font-bold text-text sm:text-2xl">Welcome back, {firstName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="secondary" className="hidden sm:inline-flex" onClick={toggleTheme}>
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            <span className="ml-2">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </Button>
          <button type="button" className="rounded-2xl border border-border bg-surfaceAlt p-3 text-text shadow-sm">
            <BellIcon className="h-4 w-4" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex items-center gap-3 rounded-[20px] border border-border bg-surfaceAlt px-3 py-2 text-sm text-text shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accentSoft text-accent">
                {user?.full_name ? user.full_name.slice(0, 1).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
              <div className="hidden text-left sm:block">
                <p className="font-semibold leading-none">{user?.full_name || 'Account'}</p>
                <p className="text-xs text-muted">{user?.email || 'Signed in'}</p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-muted" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-3 w-56 rounded-[24px] border border-border bg-surface p-2 shadow-soft">
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-text hover:bg-accentSoft">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-text hover:bg-accentSoft">
                  <SettingsIcon className="h-4 w-4" /> Settings
                </Link>
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-danger hover:bg-accentSoft">
                  <LogoutIcon className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}