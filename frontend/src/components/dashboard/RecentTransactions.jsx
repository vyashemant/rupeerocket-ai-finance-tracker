import { Card } from '../ui/Card'
import { formatCurrency, formatDate } from '../../lib/format'

export function RecentTransactions({ transactions = [] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-text">Recent transactions</h3>
          <p className="mt-1 text-sm text-muted">Latest account activity in one view.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {transactions.length ? transactions.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-surfaceAlt px-4 py-3">
            <div>
              <p className="font-medium text-text">{item.title}</p>
              <p className="text-xs text-muted">{item.category_name || 'Uncategorized'} · {formatDate(item.date)}</p>
            </div>
            <div className={`text-sm font-semibold ${item.type === 'expense' ? 'text-danger' : 'text-success'}`}>
              {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted">
            No transactions yet. Add one to start tracking cash flow.
          </div>
        )}
      </div>
    </Card>
  )
}