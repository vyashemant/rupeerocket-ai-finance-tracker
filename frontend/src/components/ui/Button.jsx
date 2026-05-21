export function Button({ children, className = '', variant = 'primary', type = 'button', ...props }) {
  const variants = {
    primary:
      'bg-accent text-white shadow-soft hover:translate-y-[-1px] hover:shadow-xl',
    secondary:
      'bg-surface text-text border border-border hover:bg-surfaceAlt',
    ghost:
      'bg-transparent text-text hover:bg-accentSoft',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}