export function LoadingState({ label = 'Loading data' }) {
  return (
    <div className="flex items-center justify-center rounded-3xl border border-border bg-surface px-6 py-12 text-sm text-muted">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <span>{label}...</span>
      </div>
    </div>
  )
}