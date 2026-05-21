import React from 'react'

export function EyeIcon({ className = 'h-5 w-5', ariaHidden = true }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden={ariaHidden}>
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeOffIcon({ className = 'h-5 w-5', ariaHidden = true }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden={ariaHidden}>
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10.94 10.94A3 3 0 0113.06 13.06" />
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.27C11.06 5.09 12.27 5 13.5 5c4.477 0 8.268 2.943 9.542 7-1.064 3.39-3.64 5.83-6.6 6.8M5.5 5.5C3.77 6.99 2.46 8.92 1.66 11c1.274 4.057 5.065 7 9.542 7 1.19 0 2.33-.17 3.38-.48" />
    </svg>
  )
}

export default EyeIcon
