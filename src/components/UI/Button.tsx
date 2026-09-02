import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-hover/90 active:shadow-none',
  secondary:
    'bg-secondary text-white shadow-sm hover:bg-secondary-hover active:bg-secondary-hover/90 active:shadow-none',
  ghost: 'bg-transparent text-text hover:bg-surface-alt hover:text-text',
  danger:
    'bg-danger text-white shadow-sm hover:bg-danger-hover active:bg-danger-hover/90 active:shadow-none',
  outline:
    'bg-transparent border border-border text-text shadow-sm hover:bg-surface-alt hover:border-border-dark active:bg-surface',
}

const sizes: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
