import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card } from '../components/ui/Card'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { StatCard } from '../components/ui/StatCard'
import { SpendingChart } from '../components/dashboard/SpendingChart'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryResponse, trendResponse] = await Promise.all([
        api.get('/api/dashboard/summary'),
        api.get('/api/dashboard/trend'),
      ])
      setSummary(summaryResponse.data.data.summary)
      setTrend(trendResponse.data.data.items)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return <LoadingState label="Loading dashboard" />
  }

  if (error) {
    return <ErrorState title="Dashboard unavailable" message={error} onRetry={loadDashboard} />
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Total balance" value={summary?.total_balance} tone={summary?.total_balance >= 0 ? 'success' : 'danger'} />
        <StatCard label="Monthly income" value={summary?.monthly_income} />
        <StatCard label="Monthly expenses" value={summary?.monthly_expenses} tone="danger" />
        <Card>
          <p className="text-sm font-medium text-muted">Savings rate</p>
          <div className="mt-3 font-display text-3xl font-bold text-text">{Math.round(summary?.savings_rate || 0)}%</div>
          <p className="mt-2 text-xs text-muted">Based on this month’s income and expenses.</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <SpendingChart data={trend} />
        <CategoryBreakdown data={summary?.expense_breakdown || []} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <RecentTransactions transactions={summary?.recent_transactions || []} />
        <Card>
          <h3 className="font-display text-lg font-bold text-text">Dashboard notes</h3>
          <div className="mt-4 space-y-4 text-sm text-muted">
            <p>Protected routes, reusable cards, and data fetching are already wired for the dashboard flow.</p>
            <p>AI insights will plug into the existing analytics seam without changing the frontend route structure.</p>
            <p>Next step: add transaction creation and monthly analytics interactions.</p>
          </div>
        </Card>
      </section>
    </div>
  )
}