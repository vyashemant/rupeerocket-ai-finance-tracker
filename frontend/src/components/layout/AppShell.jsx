import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-col">
        <Topbar onMenuClick={() => setMobileOpen((current) => !current)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}