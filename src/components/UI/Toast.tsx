import { create } from 'zustand'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: ToastItem[]
  show: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  show: (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().dismiss(id), 3000)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const colors = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-primary',
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 shadow-lg text-sm"
          >
            <Icon className={`h-4 w-4 ${colors[t.type]}`} />
            <span className="text-text">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-2 text-text-muted hover:text-text cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
