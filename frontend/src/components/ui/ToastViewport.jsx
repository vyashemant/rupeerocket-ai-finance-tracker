import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../contexts/ToastContext'
import { XIcon } from './Icons'

const toneStyles = {
  info: 'border-sky-500/20 bg-sky-500/10 text-text',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-text',
  error: 'border-rose-500/20 bg-rose-500/10 text-text',
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md flex-col gap-3 sm:right-6 sm:top-6 sm:w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto rounded-3xl border p-4 shadow-soft backdrop-blur-xl ${toneStyles[toast.type] || toneStyles.info}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm text-muted">{toast.message}</p> : null}
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} className="rounded-full p-1 text-muted transition hover:text-text">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}