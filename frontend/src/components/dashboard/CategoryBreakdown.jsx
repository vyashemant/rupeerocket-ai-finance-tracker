import { Card } from '../ui/Card'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../lib/format'

const colors = ['#0ea5e9', '#f97316', '#8b5cf6', '#ef4444', '#14b8a6', '#22c55e', '#f59e0b']

export function CategoryBreakdown({ data = [] }) {
  return (
    <Card className="h-full">
      <div>
        <h3 className="font-display text-lg font-bold text-text">Expense breakdown</h3>
        <p className="mt-1 text-sm text-muted">Where this month’s money is going.</p>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="name" innerRadius={72} outerRadius={112} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color || colors[index % colors.length]} />
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