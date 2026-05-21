import { forwardRef } from 'react'

export const Select = forwardRef(function Select({ className = '', label, children, error, ...props }, ref) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-2 block text-sm font-medium text-muted">{label}</span> : null}
      <select
        ref={ref}
        className="w-full rounded-2xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-2 block text-xs text-danger">{error}</span> : null}
    </label>
  )
})