import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-text">Page not found</h1>
        <p className="mt-4 text-sm leading-6 text-muted">The page you are looking for does not exist. Return to the dashboard or landing page.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/dashboard"><Button>Dashboard</Button></Link>
          <Link to="/"><Button variant="secondary">Home</Button></Link>
        </div>
      </div>
    </div>
  )
}