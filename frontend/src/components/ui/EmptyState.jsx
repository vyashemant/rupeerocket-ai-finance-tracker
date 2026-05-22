import { Button } from './Button'

export function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-surface/80 p-8 text-center shadow-soft">
      <h3 className="font-display text-xl font-bold text-text">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">{message}</p>
      {actionLabel ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}