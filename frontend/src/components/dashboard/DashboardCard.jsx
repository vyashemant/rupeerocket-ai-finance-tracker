import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { formatCurrency } from '../../lib/format'

const tones = {
  default: 'from-cyan-500/20 to-transparent',
  success: 'from-emerald-500/20 to-transparent',
  danger: 'from-rose-500/20 to-transparent',
  warning: 'from-amber-500/20 to-transparent',
}

export function DashboardCard({ title, value, subtitle, tone = 'default', icon }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }}>
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone] || tones.default}`} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">{title}</p>
            <div className="mt-3 font-display text-3xl font-bold text-text">{typeof value === 'number' ? formatCurrency(value) : value}</div>
            {subtitle ? <p className="mt-2 text-xs text-muted">{subtitle}</p> : null}
          </div>
          {icon ? <div className="rounded-2xl bg-accentSoft p-3 text-accent">{icon}</div> : null}
        </div>
      </Card>
    </motion.div>
  )
}