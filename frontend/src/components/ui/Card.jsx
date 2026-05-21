export function Card({ children, className = '' }) {
  return <div className={`glass-panel rounded-3xl p-5 ${className}`}>{children}</div>
}