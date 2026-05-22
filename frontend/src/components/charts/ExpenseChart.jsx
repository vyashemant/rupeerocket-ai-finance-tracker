import { Card } from '../ui/Card'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../lib/format'

const palette = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#f97316', '#f59e0b', '#ef4444', '#22c55e']

export function ExpenseChart({ data = [] }) {
  return (
    <Card className="h-full">
      <div>
        <h3 className="font-display text-lg font-bold text-text">Expense categories</h3>
        <p className="mt-1 text-sm text-muted">The current month’s category distribution.</p>
      </div>
      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="name" innerRadius={78} outerRadius={118} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={entry.color || palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}