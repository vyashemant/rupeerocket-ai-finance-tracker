import { Card } from './Card'
import { formatCurrency } from '../../lib/format'

export function StatCard({ label, value, delta, tone = 'default' }) {
  const toneClasses = {
    default: 'text-text',
    success: 'text-success',
    danger: 'text-danger',
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-cyan-300" />
      <p className="text-sm font-medium text-muted">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className={`font-display text-3xl font-bold ${toneClasses[tone]}`}>{formatCurrency(value)}</div>
          {delta ? <p className="mt-2 text-xs text-muted">{delta}</p> : null}
        </div>
      </div>
    </Card>
  )
}