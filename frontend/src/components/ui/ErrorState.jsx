import { Button } from './Button'

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-10 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="font-display text-xl font-bold text-text">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{message || 'We could not load this section right now. Try again in a moment.'}</p>
        {onRetry ? (
          <Button className="mt-6" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  )
}