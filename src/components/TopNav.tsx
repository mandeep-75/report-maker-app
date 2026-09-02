import { Home, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '../utils/cn'

export type Screen = 'home' | 'settings' | 'editor'

const NAV: { screen: 'home' | 'settings'; label: string; icon: typeof Home }[] = [
  { screen: 'home', label: 'Home', icon: Home },
  { screen: 'settings', label: 'Settings', icon: SettingsIcon },
]

export function TopNav({
  active,
  onNavigate,
}: {
  active: Screen
  onNavigate: (s: 'home' | 'settings') => void
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-2.5">
      <div className="flex items-center gap-7">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="accent-solid flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white shadow-sm">
            R
          </div>
          <span className="text-sm font-bold tracking-wide text-text">REPORT MAKER</span>
        </button>
        <nav className="flex items-center gap-1 rounded-lg bg-surface-alt/70 p-1">
          {NAV.map(({ screen, label, icon: Icon }) => (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all duration-150 cursor-pointer focus-ring',
                active === screen
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-muted hover:text-text'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/mandeep-75"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt hover:border-border-dark"
          title="GitHub"
        >
          GitHub ↗
        </a>
        <a
          href="https://www.instagram.com/mandeep.xdev/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt hover:border-border-dark"
          title="Instagram"
        >
          Instagram ↗
        </a>
        <a
          href="https://mandeep-75.github.io/Mandeep.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="accent-solid flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          title="View portfolio"
        >
          Portfolio ↗
        </a>
      </div>
    </header>
  )
}
