import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ChartIcon, ReceiptIcon, SparklesIcon, PlusIcon } from '../components/ui/Icons'

const features = [
  { title: 'AI-ready insights', description: 'Readable recommendations that turn spending data into action.', icon: SparklesIcon },
  { title: 'Receipt intelligence', description: 'Scan receipts and auto-create transactions in one step.', icon: ReceiptIcon },
  { title: 'Premium analytics', description: 'Beautiful charts, summaries, and cash-flow visibility.', icon: ChartIcon },
  { title: 'Fast transactions', description: 'Quick add flows designed for mobile-first tracking.', icon: PlusIcon },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-panel flex items-center justify-between rounded-[28px] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">RupeeRocket</p>
            <h1 className="mt-1 font-display text-xl font-bold text-text">AI-powered finance cockpit</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/login"><Button variant="secondary">Login</Button></Link>
            <Link to="/signup"><Button>Get started</Button></Link>
          </div>
        </header>

        <main className="grid items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <section>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted shadow-soft">
                <SparklesIcon className="h-4 w-4 text-accent" />
                Smart spending for modern teams and individuals
              </div>
              <h2 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.03] text-text sm:text-6xl">
                See every rupee clearly, then let AI help you act on it.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                RupeeRocket combines a polished fintech dashboard, secure JWT auth, live analytics, and receipt OCR so you can track, categorize, and understand spending without friction.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup"><Button className="px-6 py-3 text-base">Create account</Button></Link>
                <Link to="/login"><Button variant="secondary" className="px-6 py-3 text-base">Open dashboard</Button></Link>
              </div>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index }}>
                    <Card className="h-full">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-accentSoft p-3 text-accent">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text">{feature.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted">{feature.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-cyan-500/20 blur-3xl" />
            <Card className="relative overflow-hidden p-0">
              <div className="border-b border-border px-6 py-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Preview</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-text">Dashboard snapshot</h3>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Card className="bg-surfaceAlt">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Balance</p>
                  <div className="mt-3 font-display text-3xl font-bold text-text">₹128,400</div>
                </Card>
                <Card className="bg-surfaceAlt">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Expenses</p>
                  <div className="mt-3 font-display text-3xl font-bold text-text">₹42,900</div>
                </Card>
                <Card className="sm:col-span-2 bg-surfaceAlt">
                  <div className="space-y-3">
                    <div className="h-3 rounded-full bg-accentSoft" />
                    <div className="h-3 w-4/5 rounded-full bg-accentSoft" />
                    <div className="h-3 w-3/5 rounded-full bg-accentSoft" />
                  </div>
                </Card>
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}