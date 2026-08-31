import { FileText, Upload } from 'lucide-react'
import { useSettings } from '../store/settingsStore'
import { Input } from '../components/UI/Input'
import { Select } from '../components/UI/Select'
import { fileToDataUrl } from '../utils/imageHelpers'
import { cn } from '../utils/cn'

export function SettingsScreen() {
  const settings = useSettings()
  const { appearance, pageFormat, orientation, collegeName, department, logo } = settings

  const onLogo = async (file: File) => {
    const url = await fileToDataUrl(file)
    settings.setInstitution({ logo: url })
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-2xl px-8 py-10">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Personalise the editor and your default report.</p>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Appearance
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(['dark', 'light'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => settings.setAppearance(mode)}
                className={cn(
                  'rounded-xl border p-4 text-left capitalize transition-colors cursor-pointer',
                  appearance === mode
                    ? 'border-primary bg-surface'
                    : 'border-border bg-surface hover:border-primary'
                )}
              >
                <div className="text-sm font-semibold capitalize text-text">{mode}</div>
                <div className="mt-1 text-xs text-text-muted">
                  {mode === 'dark' ? 'Dark workspace (recommended)' : 'Light workspace'}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Default Report
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Page Size"
              value={pageFormat}
              onChange={(e) => settings.setPageFormat(e.target.value)}
              options={[
                { value: 'A4', label: 'A4' },
                { value: 'A3', label: 'A3' },
                { value: 'Letter', label: 'Letter' },
              ]}
            />
            <Select
              label="Orientation"
              value={orientation}
              onChange={(e) => settings.setOrientation(e.target.value)}
              options={[
                { value: 'Portrait', label: 'Portrait' },
                { value: 'Landscape', label: 'Landscape' },
              ]}
            />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Institution
          </h2>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-4">
              <div className="accent-solid flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-white">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <FileText className="h-7 w-7" />
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-alt">
                <Upload className="h-4 w-4" /> Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])}
                />
              </label>
              {logo && (
                <button
                  onClick={() => settings.setInstitution({ logo: null })}
                  className="text-xs text-text-muted hover:text-danger cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
            <Input
              label="College Name"
              value={collegeName}
              onChange={(e) => settings.setInstitution({ collegeName: e.target.value })}
              placeholder="Khalsa College Garhdiwala"
            />
            <Input
              label="Department"
              value={department}
              onChange={(e) => settings.setInstitution({ department: e.target.value })}
              placeholder="Department of History"
            />
            <p className="text-xs text-text-muted">
              These are prefilled whenever you start a new report.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            About
          </h2>
          <p className="mt-2 text-sm text-text">
            Report Maker · Built by <span className="font-semibold text-text">Mandeep</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://mandeep-75.github.io/Mandeep.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/mandeep-75"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://www.instagram.com/mandeep.xdev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Instagram
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
