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

export function SignupPage() {
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { full_name: '', email: '', password: '', confirm_password: '' },
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values) => {
    setSubmitError('')
    try {
      await registerUser({ full_name: values.full_name, email: values.email, password: values.password })
      navigate('/dashboard')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to create your account right now.')
    }
  }

  const password = watch('password')

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">RupeeRocket</p>
          <h1 className="mt-6 max-w-md font-display text-5xl font-bold leading-tight">A modern finance workspace built for momentum.</h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">Create your account to unlock secure dashboards, category intelligence, and receipt OCR.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/10 text-white"><p className="text-sm text-white/70">Framed UX</p></Card>
          <Card className="border-white/10 bg-white/10 text-white"><p className="text-sm text-white/70">Production ready</p></Card>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Get started</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">Create your account</h2>
            <p className="mt-2 text-sm text-muted">Set up secure access and start tracking spending.</p>

            {submitError ? <ErrorState title="Signup failed" message={submitError} /> : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input label="Full name" autoComplete="name" error={errors.full_name?.message} {...register('full_name', { required: 'Full name is required' })} />
              <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                hint="Use at least 8 characters."
                error={errors.password?.message}
                trailing={
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="rounded px-2 py-1 text-muted hover:text-text">
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                }
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
              />
              <Input
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={errors.confirm_password?.message}
                trailing={
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="rounded px-2 py-1 text-muted hover:text-text">
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                }
                {...register('confirm_password', {
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</Button>
            </form>

            <p className="mt-6 text-sm text-muted">
              Already have an account? <Link className="font-semibold text-accent" to="/login">Login</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}