import { Card } from '../ui/Card'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatMonthLabel } from '../../lib/format'

export function SpendingChart({ data = [] }) {
  return (
    <Card className="h-full">
      <div>
        <h3 className="font-display text-lg font-bold text-text">Cash flow trend</h3>
        <p className="mt-1 text-sm text-muted">A six-month view of income, expenses, and net cash flow.</p>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.36} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="var(--color-muted)" />
            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} stroke="var(--color-muted)" />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
              }}
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(label) => formatMonthLabel(label)}
            />
            <Area type="monotone" dataKey="income" stroke="#0ea5e9" fill="url(#incomeFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}