import { ReactNode, useState } from 'react'
import { cn } from '../../utils/cn'

export function Tooltip({
  content,
  children,
  className,
}: {
  content: string
  children: ReactNode
  className?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-surface-dark px-2 py-1 text-[10px] text-text-inverse shadow-lg">
          {content}
        </span>
      )}
    </span>
  )
}
