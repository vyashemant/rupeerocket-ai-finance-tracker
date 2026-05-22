import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { formatCurrency, formatDate } from '../../lib/format'

export function TransactionTable({ transactions = [] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-text">Recent transactions</h3>
          <p className="mt-1 text-sm text-muted">A quick view of your latest money movement.</p>
        </div>
      </div>

      {transactions.length ? (
        <div className="mt-5 overflow-hidden rounded-3xl border border-border">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-surfaceAlt/70 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface/80">
              {transactions.map((item) => (
                <tr key={item.id} className="hover:bg-accentSoft/40">
                  <td className="px-4 py-3 font-medium text-text">{item.title}</td>
                  <td className="px-4 py-3 text-muted">{item.category_name || item.category || 'Uncategorized'}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(item.date)}</td>
                  <td className={`px-4 py-3 font-semibold ${item.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                    {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState title="No transactions yet" message="Start with a quick expense or scan a receipt to populate the dashboard." />
        </div>
      )}
    </Card>
  )
}