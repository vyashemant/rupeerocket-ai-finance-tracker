import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DashboardCard } from '../../components/dashboard/DashboardCard'
import { AIInsightCard } from '../../components/dashboard/AIInsightCard'
import { TransactionTable } from '../../components/dashboard/TransactionTable'
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart'
import { ExpenseChart } from '../../components/charts/ExpenseChart'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ReceiptIcon, PlusIcon, SparklesIcon } from '../../components/ui/Icons'
import { getAiInsights, getDashboardSummary, getDashboardTrend } from '../../services/dashboard'

function mapInsights(insights) {
  return (insights || []).map((message, index) => ({
    title: index === 0 ? 'AI recommendation' : 'Opportunity',
    message,
    badge: index === 0 ? 'Recommendation' : 'Insight',
  }))
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [aiInsights, setAiInsights] = useState([])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryResult, trendResult, insightResult] = await Promise.allSettled([
        getDashboardSummary(),
        getDashboardTrend(),
        getAiInsights(),
      ])

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value)
      }
      if (trendResult.status === 'fulfilled') {
        setTrend(trendResult.value)
      }
      if (insightResult.status === 'fulfilled') {
        setAiInsights(mapInsights(insightResult.value))
      }

      if (summaryResult.status === 'rejected' && trendResult.status === 'rejected') {
        throw summaryResult.reason || trendResult.reason
      }
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
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <LoadingSpinner label="Loading dashboard" />
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Dashboard unavailable" message={error} actionLabel="Retry" onAction={loadDashboard} />
  }

  const insights = aiInsights.length
    ? aiInsights
    : [
        { title: 'Keep going', message: 'Add more transactions to unlock stronger recommendations.', badge: 'Prompt' },
      ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Total balance" value={summary?.total_balance || 0} tone={(summary?.total_balance || 0) >= 0 ? 'success' : 'danger'} icon={<SparklesIcon className="h-5 w-5" />} />
        <DashboardCard title="Monthly income" value={summary?.monthly_income || 0} tone="success" />
        <DashboardCard title="Monthly expenses" value={summary?.monthly_expenses || 0} tone="danger" />
        <DashboardCard title="Savings rate" value={`${Math.round(summary?.savings_rate || 0)}%`} subtitle="Based on this month’s income and expenses." tone="warning" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <IncomeExpenseChart data={trend} />
        <ExpenseChart data={summary?.expense_breakdown || []} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TransactionTable transactions={summary?.recent_transactions || []} />

        <div className="space-y-4">
          <div className="glass-panel rounded-[28px] p-5">
            <h3 className="font-display text-lg font-bold text-text">Quick actions</h3>
            <p className="mt-1 text-sm text-muted">Move fast when you spot a transaction.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link to="/transactions/new"><Button className="w-full"><PlusIcon className="h-4 w-4" /> <span className="ml-2">Add transaction</span></Button></Link>
              <Link to="/receipts"><Button variant="secondary" className="w-full"><ReceiptIcon className="h-4 w-4" /> <span className="ml-2">Scan receipt</span></Button></Link>
            </div>
          </div>

          <div className="grid gap-4">
            {insights.map((insight) => (
              <AIInsightCard key={`${insight.title}-${insight.message}`} title={insight.title} message={insight.message} badge={insight.badge} />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  )
}