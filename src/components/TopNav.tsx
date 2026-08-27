import { Home, Settings as SettingsIcon, Plus } from 'lucide-react'
import { cn } from '../utils/cn'

export type Screen = 'home' | 'settings' | 'editor'

const NAV: { screen: Screen; label: string; icon: typeof Home }[] = [
  { screen: 'home', label: 'Home', icon: Home },
  { screen: 'settings', label: 'Settings', icon: SettingsIcon },
]

export function TopNav({
  active,
  onNavigate,
  onNew,
}: {
  active: Screen
  onNavigate: (s: Screen) => void
  onNew: () => void
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="accent-solid flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white">
            R
          </div>
          <span className="text-sm font-bold tracking-wide text-text">REPORT MAKER</span>
        </button>
        <nav className="flex items-center gap-1">
          {NAV.map(({ screen, label, icon: Icon }) => (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer',
                active === screen
                  ? 'bg-surface-alt text-primary'
                  : 'text-text-muted hover:text-text'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
      <button
        onClick={onNew}
        className="accent-solid flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
      >
        <Plus className="h-4 w-4" /> Create New Report
      </button>
    </header>
  )
}
