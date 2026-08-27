import { cn } from '../../utils/cn'

interface TabsProps {
  tabs: { value: string; label: string }[]
  active: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer',
            active === t.value
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
