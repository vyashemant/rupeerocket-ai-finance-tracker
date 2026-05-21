import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions/new', label: 'Add Transaction' },
  { to: '/analytics', label: 'Analytics' },
]

export function Sidebar() {
  return (
    <aside className="hidden border-r border-border bg-surface/80 px-5 py-6 backdrop-blur-xl lg:flex lg:min-h-screen lg:flex-col">
      <div className="rounded-3xl bg-gradient-to-br from-accent to-cyan-500 px-5 py-6 text-white shadow-soft">
        <p className="text-xs uppercase tracking-[0.25em] text-white/80">RupeeRocket</p>
        <h1 className="mt-3 font-display text-2xl font-bold">Finance control center</h1>
        <p className="mt-2 text-sm text-white/80">Track money, analyze habits, and prepare for AI-guided insights.</p>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-accent text-white shadow-soft' : 'text-muted hover:bg-accentSoft hover:text-text'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-border bg-surfaceAlt p-4 text-sm text-muted">
        Built for clean personal finance workflows with a future-ready AI layer.
      </div>
    </aside>
  )
}