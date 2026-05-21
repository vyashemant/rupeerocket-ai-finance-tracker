import { forwardRef } from 'react'

export const Input = forwardRef(function Input({ className = '', label, hint, error, trailing, ...props }, ref) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-2 block text-sm font-medium text-muted">{label}</span> : null}
      <div className="relative">
        <input
          ref={ref}
          className="w-full rounded-2xl border border-border bg-surfaceAlt px-4 py-3 pr-12 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
          {...props}
        />
        {trailing ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
      {hint ? <span className="mt-2 block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="mt-2 block text-xs text-danger">{error}</span> : null}
    </label>
  )
})