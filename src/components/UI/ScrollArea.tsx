import { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface ScrollAreaProps {
  children: ReactNode
  className?: string
}

export function ScrollArea({ children, className }: ScrollAreaProps) {
  return (
    <div className={cn('overflow-y-auto overflow-x-hidden', className)}>{children}</div>
  )
}
