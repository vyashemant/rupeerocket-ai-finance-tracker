import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { ChartIcon, HomeIcon, PlusIcon, ReceiptIcon, SettingsIcon, UserIcon, XIcon } from '../ui/Icons'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/transactions/new', label: 'Add Transaction', icon: PlusIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartIcon },
  { to: '/receipts', label: 'Receipt Scanner', icon: ReceiptIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function NavItem({ item, onClose }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-accent text-white shadow-soft' : 'text-muted hover:bg-accentSoft hover:text-text'}`
      }
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </NavLink>
  )
}

export function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className="hidden border-r border-border bg-surface/80 px-5 py-6 backdrop-blur-xl lg:flex lg:min-h-screen lg:flex-col">
        <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-cyan-950 to-cyan-600 px-5 py-6 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.25em] text-white/80">RupeeRocket</p>
          <h1 className="mt-3 font-display text-2xl font-bold">AI finance cockpit</h1>
          <p className="mt-2 text-sm text-white/75">Track money, scan receipts, and get sharper insights from every transaction.</p>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} onClose={onClose} />
          ))}
        </nav>

        <div className="mt-auto rounded-[28px] border border-border bg-surfaceAlt p-4 text-sm text-muted">
          Built for disciplined money management with a premium fintech interface.
        </div>
      </aside>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[84%] max-w-sm border-r border-border bg-surface/95 px-5 py-6 backdrop-blur-xl lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">RupeeRocket</p>
                  <h1 className="font-display text-xl font-bold text-text">AI finance cockpit</h1>
                </div>
                <button type="button" onClick={onClose} className="rounded-2xl border border-border bg-surfaceAlt p-2 text-text">
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-8 space-y-2">
                {navItems.map((item) => (
                  <NavItem key={item.to} item={item} onClose={onClose} />
                ))}
              </nav>

              <div className="mt-8 rounded-[28px] border border-border bg-surfaceAlt p-4 text-sm text-muted">
                Premium mobile-first finance workspace with receipt scanning and AI insights.
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}