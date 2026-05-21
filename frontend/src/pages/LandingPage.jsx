import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const features = [
  'Secure JWT-based authentication',
  'Income and expense tracking',
  'Dashboard analytics and spending charts',
  'Dark/light mode with a polished fintech feel',
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-hero-glow">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-3xl border border-border bg-surface/70 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">RupeeRocket</p>
            <h1 className="font-display text-xl font-bold text-text">AI-ready finance tracking</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/login"><Button variant="secondary">Login</Button></Link>
            <Link to="/signup"><Button>Sign up</Button></Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <section className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Personal finance, designed with discipline
            </div>
            <h2 className="mt-6 font-display text-5xl font-bold leading-[1.04] text-text sm:text-6xl">
              See your money clearly. Build habits that scale.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              RupeeRocket gives you secure account access, clean dashboards, monthly spending analytics, and a structure that can later support AI-powered recommendations without a rewrite.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup"><Button className="px-6 py-3 text-base">Start tracking</Button></Link>
              <Link to="/login"><Button variant="secondary" className="px-6 py-3 text-base">I already have an account</Button></Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature} className="animate-floaty">
                  <p className="text-sm font-medium text-text">{feature}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />
            <Card className="relative overflow-hidden p-0">
              <div className="border-b border-border px-5 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted">Preview</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-text">Fintech dashboard</h3>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Card className="bg-surfaceAlt">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Balance</p>
                  <div className="mt-3 font-display text-3xl font-bold text-text">₹128,400</div>
                </Card>
                <Card className="bg-surfaceAlt">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Spending</p>
                  <div className="mt-3 font-display text-3xl font-bold text-text">₹42,900</div>
                </Card>
                <Card className="sm:col-span-2 bg-surfaceAlt">
                  <div className="space-y-3">
                    <div className="h-2 rounded-full bg-accentSoft" />
                    <div className="h-2 w-4/5 rounded-full bg-accentSoft" />
                    <div className="h-2 w-3/5 rounded-full bg-accentSoft" />
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