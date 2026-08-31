import { InputHTMLAttributes, forwardRef } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: 'calendar' | null
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, error, icon, type, ...props }, ref) => (
    <div className={cn('flex min-w-0 flex-col gap-1', containerClassName)}>
      {label && <label className="text-xs font-medium text-text-muted">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary',
            icon === 'calendar' && 'pr-9',
            className
          )}
          {...props}
        />
        {icon === 'calendar' && (
          <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        )}
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'
