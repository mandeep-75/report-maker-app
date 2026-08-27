import { cn } from '../../utils/cn'

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer"
    >
      <span
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </span>
      {label && <span className="text-xs text-text-muted">{label}</span>}
    </button>
  )
}
