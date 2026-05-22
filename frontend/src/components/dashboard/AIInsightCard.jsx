import { motion } from 'framer-motion'
import { Card } from '../ui/Card'

export function AIInsightCard({ title, message, accent = 'text-accent', badge }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }}>
      <Card className="h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${accent}`}>{badge || 'AI insight'}</p>
            <h3 className="mt-2 font-display text-lg font-bold text-text">{title}</h3>
          </div>
          <div className="rounded-2xl bg-accentSoft px-3 py-2 text-sm font-semibold text-accent">AI</div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">{message}</p>
      </Card>
    </motion.div>
  )
}