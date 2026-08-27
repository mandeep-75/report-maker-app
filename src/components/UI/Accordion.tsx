import { ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

interface AccordionItem {
  id: string
  title: ReactNode
  content: ReactNode
  actions?: ReactNode
}

export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[]
  className?: string
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null)
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item) => {
        const isOpen = open === item.id
        return (
          <div key={item.id} className="border-b border-border last:border-0">
            <div className="flex items-center justify-between px-2 py-1.5">
              <button
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex flex-1 items-center gap-1.5 text-left text-sm font-medium text-text"
              >
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                />
                {item.title}
              </button>
              {item.actions}
            </div>
            {isOpen && <div className="px-2 pb-2">{item.content}</div>}
          </div>
        )
      })}
    </div>
  )
}
