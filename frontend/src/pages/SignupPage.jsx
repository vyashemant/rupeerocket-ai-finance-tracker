import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { ErrorState } from '../components/ui/ErrorState'
import { EyeIcon, EyeOffIcon } from '../components/ui/Icons'

export function SignupPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmError, setConfirmError] = useState('')

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
    setConfirmError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }
    if (form.password !== form.confirm_password) {
      setConfirmError('Passwords do not match.')
      setLoading(false)
      return
    }
    try {
      await register(form)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to create your account right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">RupeeRocket</p>
          <h1 className="mt-6 max-w-md font-display text-5xl font-bold leading-tight">A modern personal finance workspace.</h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">Create your account to get protected access, spending dashboards, and a future-proof AI layer.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-white/70">Minimal onboarding</p>
          </Card>
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-white/70">Analytics-first UX</p>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <Card className="w-full max-w-md p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Get started</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-text">Create your account</h2>
          <p className="mt-2 text-sm text-muted">Set up secure access and start tracking spending today.</p>

          {error ? <ErrorState title="Signup failed" message={error} /> : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="Full name" name="full_name" autoComplete="name" value={form.full_name} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
              hint="Use at least 8 characters."
              trailing={
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="rounded px-2 py-1 text-muted hover:text-text focus:outline-none">
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              }
            />
            <Input
              label="Confirm password"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={handleChange}
              required
              error={confirmError}
              trailing={
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="rounded px-2 py-1 text-muted hover:text-text focus:outline-none">
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              }
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Already have an account? <Link className="font-semibold text-accent" to="/login">Login</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}