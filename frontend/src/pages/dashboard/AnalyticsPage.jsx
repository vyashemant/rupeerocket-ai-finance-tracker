import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { AIInsightCard } from '../../components/dashboard/AIInsightCard'
import { MonthlyTrendChart } from '../../components/charts/MonthlyTrendChart'
import { ExpenseChart } from '../../components/charts/ExpenseChart'
import { SpendingLineChart } from '../../components/charts/SpendingLineChart'
import { formatCurrency, formatMonthLabel } from '../../lib/format'
import { getAiInsights, getDashboardTrend, getMonthlyAnalytics } from '../../services/dashboard'

const currentMonth = new Date().toISOString().slice(0, 7)

export function AnalyticsPage() {
  const [month, setMonth] = useState(currentMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [trend, setTrend] = useState([])
  const [insights, setInsights] = useState([])

  const loadAnalytics = async (monthValue = month) => {
    setLoading(true)
    setError('')
    try {
      const [analyticsData, trendData, insightData] = await Promise.all([
        getMonthlyAnalytics(monthValue),
        getDashboardTrend(),
        getAiInsights(),
      ])
      setAnalytics(analyticsData)
      setTrend(trendData)
      setInsights(insightData)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return <div className="flex min-h-[45vh] items-center justify-center"><LoadingSpinner label="Loading analytics" /></div>
  }

  if (error) {
    return <EmptyState title="Analytics unavailable" message={error} actionLabel="Retry" onAction={() => loadAnalytics(month)} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Analytics</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text">Financial analytics</h1>
          <p className="mt-2 text-sm text-muted">{formatMonthLabel(month)} insights and movement.</p>
        </div>
        <div className="w-full sm:w-64">
          <Input label="Month" type="month" value={month} onChange={(event) => { const nextMonth = event.target.value; setMonth(nextMonth); loadAnalytics(nextMonth) }} />
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <MonthlyTrendChart data={trend} />
        <SpendingLineChart data={trend} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ExpenseChart data={analytics.expense_breakdown || []} />
        <Card>
          <h3 className="font-display text-lg font-bold text-text">Monthly summary</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Card className="bg-surfaceAlt"><p className="text-sm text-muted">Income</p><div className="mt-3 font-display text-3xl font-bold text-text">{formatCurrency(analytics.income)}</div></Card>
            <Card className="bg-surfaceAlt"><p className="text-sm text-muted">Expenses</p><div className="mt-3 font-display text-3xl font-bold text-text">{formatCurrency(analytics.expenses)}</div></Card>
            <Card className="bg-surfaceAlt"><p className="text-sm text-muted">Net</p><div className="mt-3 font-display text-3xl font-bold text-text">{formatCurrency(analytics.net)}</div></Card>
          </div>

          <div className="mt-6 rounded-[28px] border border-border bg-surfaceAlt/70 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">Prediction cards</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(insights.length ? insights : ['Keep tracking transactions to unlock more predictions.']).slice(0, 4).map((item, index) => (
                <AIInsightCard
                  key={typeof item === 'string' ? item : item}
                  title={typeof item === 'string' ? 'Prediction' : `Insight ${index + 1}`}
                  message={typeof item === 'string' ? item : item}
                  badge={index === 0 ? 'AI summary' : 'Prediction'}
                />
              ))}
            </div>
          </div>
        </Card>
      </section>
    </motion.div>
  )
}