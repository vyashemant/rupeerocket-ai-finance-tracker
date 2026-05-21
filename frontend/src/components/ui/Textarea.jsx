import { forwardRef } from 'react'

export const Textarea = forwardRef(function Textarea({ className = '', label, error, ...props }, ref) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-2 block text-sm font-medium text-muted">{label}</span> : null}
      <textarea
        ref={ref}
        className="min-h-[120px] w-full rounded-2xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
        {...props}
      />
      {error ? <span className="mt-2 block text-xs text-danger">{error}</span> : null}
    </label>
  )
})