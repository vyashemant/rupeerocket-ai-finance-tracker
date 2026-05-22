import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/ui/Card'
import { DashboardCard } from '../../components/dashboard/DashboardCard'
import { UserIcon, SparklesIcon } from '../../components/ui/Icons'

function initials(name) {
  return (name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accentSoft text-2xl font-bold text-accent">
            {initials(user?.full_name)}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Profile</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-text">{user?.full_name || 'Account profile'}</h1>
            <p className="mt-2 text-sm text-muted">{user?.email || 'Signed in user'}</p>
          </div>
        </div>
        <div className="rounded-[28px] bg-accentSoft px-4 py-3 text-accent">
          <SparklesIcon className="inline h-4 w-4" /> Secure JWT authenticated session
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Security" value="Protected" subtitle="Token-based auth with auto-hydration" tone="success" icon={<UserIcon className="h-5 w-5" />} />
        <DashboardCard title="Theme" value="Persistent" subtitle="Light and dark mode saved locally" tone="warning" />
        <DashboardCard title="AI" value="Enabled" subtitle="Insights and receipt parsing ready" tone="default" />
      </section>

      <Card>
        <h3 className="font-display text-lg font-bold text-text">Account details</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card className="bg-surfaceAlt"><p className="text-sm text-muted">Full name</p><p className="mt-2 font-semibold text-text">{user?.full_name || 'Not available'}</p></Card>
          <Card className="bg-surfaceAlt"><p className="text-sm text-muted">Email</p><p className="mt-2 font-semibold text-text">{user?.email || 'Not available'}</p></Card>
        </div>
      </Card>
    </motion.div>
  )
}