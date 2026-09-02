import { useSettings, FREE_MODELS } from '../store/settingsStore'
import { Select } from '../components/UI/Select'
import { Input } from '../components/UI/Input'
import { cn } from '../utils/cn'

export function SettingsScreen() {
  const settings = useSettings()
  const { appearance } = settings

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-2xl px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-text">Settings</h1>
          <p className="mt-1.5 text-sm text-text-muted">Personalise the editor and your default report.</p>
        </div>

        <section className="mt-8">
          <h2 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Appearance
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(['dark', 'light'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => settings.setAppearance(mode)}
                className={cn(
                  'rounded-xl border p-4 text-left capitalize transition-all duration-200 cursor-pointer focus-ring',
                  appearance === mode
                    ? 'border-primary bg-primary-soft shadow-sm'
                    : 'border-border bg-surface hover:border-primary/50 hover:shadow-card'
                )}
              >
                <div className={cn('text-sm font-semibold capitalize', appearance === mode ? 'text-primary' : 'text-text')}>{mode}</div>
                <div className="mt-1 text-xs text-text-muted">
                  {mode === 'dark' ? 'Dark workspace (recommended)' : 'Light workspace'}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Default Report
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Page Size"
              value="A4"
              onChange={() => {}}
              options={[{ value: 'A4', label: 'A4' }]}
            />
            <Select
              label="Orientation"
              value="Portrait"
              onChange={() => {}}
              options={[{ value: 'Portrait', label: 'Portrait' }]}
            />
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            AI Assistant
          </h2>
          <p className="mt-1.5 text-xs text-text-muted">
            Add your OpenCode Zen API key to enable AI generation in report sections.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="OpenCode Zen API Key"
              type="password"
              value={settings.apiKey}
              onChange={(e) => settings.setApiKey(e.target.value)}
              placeholder="zen_..."
            />
            <Select
              label="Model"
              value={settings.selectedModel}
              onChange={(e) => settings.setSelectedModel(e.target.value as (typeof FREE_MODELS)[number]['id'])}
              options={FREE_MODELS.map((m) => ({ value: m.id, label: m.label }))}
            />
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            About
          </h2>
          <p className="mt-2.5 text-sm text-text">
            Report Maker · ꧁ Built by ꧂ ꕤ <span className="font-semibold text-text">Mandeep1322</span> ꕤ
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://mandeep-75.github.io/Mandeep.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="accent-solid flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Portfolio ↗
            </a>
            <a
              href="https://github.com/mandeep-75"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-alt hover:border-border-dark"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.instagram.com/mandeep.xdev/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-alt hover:border-border-dark"
            >
              Instagram ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
