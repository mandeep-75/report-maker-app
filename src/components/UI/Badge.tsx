import { cn } from '../../utils/cn'

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-text-muted',
        className
      )}
    >
      {children}
    </span>
  )
}
