import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { ErrorState } from '../../components/ui/ErrorState'
import { EyeIcon, EyeOffIcon } from '../../components/ui/Icons'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '', password: '' } })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values) => {
    setSubmitError('')
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to sign in right now.')
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">RupeeRocket</p>
          <h1 className="mt-6 max-w-md font-display text-5xl font-bold leading-tight">Track money with clarity and confidence.</h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">Sign in to a dashboard built for disciplined saving, receipt intelligence, and AI-guided finance decisions.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/10 text-white"><p className="text-sm text-white/70">JWT protected</p></Card>
          <Card className="border-white/10 bg-white/10 text-white"><p className="text-sm text-white/70">AI ready</p></Card>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Welcome back</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">Login to RupeeRocket</h2>
            <p className="mt-2 text-sm text-muted">Access your balance, trends, and receipt scanner.</p>

            {submitError ? <ErrorState title="Login failed" message={submitError} /> : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={errors.password?.message}
                trailing={
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="rounded px-2 py-1 text-muted hover:text-text">
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                }
                {...register('password', { required: 'Password is required' })}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Button>
            </form>

            <p className="mt-6 text-sm text-muted">
              New here? <Link className="font-semibold text-accent" to="/signup">Create an account</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}