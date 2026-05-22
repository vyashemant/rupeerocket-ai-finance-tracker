export function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium text-muted shadow-soft">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <span>{label}</span>
    </div>
  )
}