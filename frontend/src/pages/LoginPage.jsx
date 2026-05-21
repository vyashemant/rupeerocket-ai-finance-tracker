import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { ErrorState } from '../components/ui/ErrorState'
import { EyeIcon, EyeOffIcon } from '../components/ui/Icons'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to sign in right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">RupeeRocket</p>
          <h1 className="mt-6 max-w-md font-display text-5xl font-bold leading-tight">Track every rupee with clarity.</h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">Sign in to a dashboard built for disciplined saving, spending visibility, and future AI assistance.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-white/70">Protected access</p>
          </Card>
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-white/70">Analytics-ready structure</p>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <Card className="w-full max-w-md p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Welcome back</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-text">Login to RupeeRocket</h2>
          <p className="mt-2 text-sm text-muted">Access your balance, monthly spending, and transaction history.</p>

          {error ? <ErrorState title="Login failed" message={error} /> : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
              trailing={
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="rounded px-2 py-1 text-muted hover:text-text focus:outline-none">
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              }
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            New here? <Link className="font-semibold text-accent" to="/signup">Create an account</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}