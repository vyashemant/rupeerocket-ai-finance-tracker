import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card } from '../components/ui/Card'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { Input } from '../components/ui/Input'
import { formatCurrency, formatMonthLabel } from '../lib/format'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const currentMonth = new Date().toISOString().slice(0, 7)

export function AnalyticsPage() {
  const [month, setMonth] = useState(currentMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState(null)

  const loadAnalytics = async (monthValue = month) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/api/analytics/monthly', { params: { month: monthValue } })
      setAnalytics(response.data.data.analytics)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const handleMonthChange = (event) => {
    const value = event.target.value
    setMonth(value)
    loadAnalytics(value)
  }

  if (loading) {
    return <LoadingState label="Loading analytics" />
  }

  if (error) {
    return <ErrorState title="Analytics unavailable" message={error} onRetry={() => loadAnalytics(month)} />
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Analytics</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text">Monthly spending review</h1>
        </div>
        <div className="w-full sm:w-64">
          <Input label="Month" type="month" value={month} onChange={handleMonthChange} />
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-bold text-text">Daily expense trend</h3>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.daily_expenses}>
                <defs>
                  <linearGradient id="dailyExpenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate()} stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => new Date(label).toDateString()} />
                <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fill="url(#dailyExpenseFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold text-text">Category distribution</h3>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.expense_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Income</p>
          <div className="mt-3 font-display text-3xl font-bold text-text">{formatCurrency(analytics.income)}</div>
        </Card>
        <Card>
          <p className="text-sm text-muted">Expenses</p>
          <div className="mt-3 font-display text-3xl font-bold text-text">{formatCurrency(analytics.expenses)}</div>
        </Card>
        <Card>
          <p className="text-sm text-muted">Net</p>
          <div className="mt-3 font-display text-3xl font-bold text-text">{formatCurrency(analytics.net)}</div>
        </Card>
      </section>

      <Card>
        <h3 className="font-display text-lg font-bold text-text">Month snapshot</h3>
        <p className="mt-2 text-sm text-muted">{formatMonthLabel(analytics.month)} analytics are ready for future AI commentary, anomaly detection, and budget coaching.</p>
      </Card>
    </div>
  )
}