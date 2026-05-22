import { Card } from '../ui/Card'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatMonthLabel } from '../../lib/format'

export function MonthlyTrendChart({ data = [] }) {
  return (
    <Card className="h-full">
      <div>
        <h3 className="font-display text-lg font-bold text-text">Monthly comparison</h3>
        <p className="mt-1 text-sm text-muted">A compact trend view of recent months.</p>
      </div>
      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="var(--color-muted)" />
            <YAxis stroke="var(--color-muted)" />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '18px',
              }}
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(label) => formatMonthLabel(label)}
            />
            <Bar dataKey="income" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}