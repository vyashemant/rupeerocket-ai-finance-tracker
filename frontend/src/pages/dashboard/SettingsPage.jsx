import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SunIcon, MoonIcon } from '../../components/ui/Icons'

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoScan, setAutoScan] = useState(true)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <Card>
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Settings</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-text">Workspace preferences</h1>
        <p className="mt-2 text-sm text-muted">Tune the frontend experience for theme, notifications, and receipt handling.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-text">Theme mode</p>
            <p className="mt-1 text-sm text-muted">Persisted across reloads.</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>{theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}<span className="ml-2">{theme === 'dark' ? 'Light' : 'Dark'}</span></Button>
        </Card>

        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-text">Notifications</p>
            <p className="mt-1 text-sm text-muted">Show finance alerts and reminders.</p>
          </div>
          <button type="button" onClick={() => setNotifications((current) => !current)} className={`rounded-full px-4 py-2 text-sm font-semibold ${notifications ? 'bg-accent text-white' : 'bg-surfaceAlt text-text'}`}>
            {notifications ? 'Enabled' : 'Disabled'}
          </button>
        </Card>

        <Card className="flex items-center justify-between gap-4 md:col-span-2">
          <div>
            <p className="font-semibold text-text">Receipt auto-processing</p>
            <p className="mt-1 text-sm text-muted">Keep the upload flow ready for OCR scanning.</p>
          </div>
          <button type="button" onClick={() => setAutoScan((current) => !current)} className={`rounded-full px-4 py-2 text-sm font-semibold ${autoScan ? 'bg-accent text-white' : 'bg-surfaceAlt text-text'}`}>
            {autoScan ? 'On' : 'Off'}
          </button>
        </Card>
      </div>
    </motion.div>
  )
}