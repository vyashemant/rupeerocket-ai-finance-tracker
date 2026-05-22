import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)
let nextToastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback((toast) => {
    nextToastId += 1
    const id = nextToastId
    const nextToast = {
      id,
      type: 'info',
      title: toast?.title || 'Notification',
      message: toast?.message || '',
    }
    setToasts((current) => [...current, nextToast])
    window.setTimeout(() => dismiss(id), toast?.duration || 3500)
    return id
  }, [dismiss])

  const value = useMemo(() => ({ toasts, pushToast, dismiss }), [toasts, pushToast, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}