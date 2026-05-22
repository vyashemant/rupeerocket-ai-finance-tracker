import { Card } from '../ui/Card'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatMonthLabel } from '../../lib/format'

export function SpendingLineChart({ data = [] }) {
  return (
    <Card className="h-full">
      <div>
        <h3 className="font-display text-lg font-bold text-text">Spending trend</h3>
        <p className="mt-1 text-sm text-muted">A line chart for month-over-month spending movement.</p>
      </div>
      <div className="mt-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="var(--color-muted)" />
            <YAxis stroke="var(--color-muted)" />
            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => formatMonthLabel(label)} />
            <Line type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}