import { create } from 'zustand'

export type Appearance = 'dark' | 'light'

export interface SettingsState {
  appearance: Appearance
  pageFormat: string
  orientation: string
  collegeName: string
  department: string
  logo: string | null
  setAppearance: (a: Appearance) => void
  setPageFormat: (v: string) => void
  setOrientation: (v: string) => void
  setInstitution: (v: { collegeName?: string; department?: string; logo?: string | null }) => void
  applyInstitution: (report: {
    eventInfo: { collegeName: string; department: string }
  }) => void
}

const KEY = 'rm-settings'

function load(): Omit<SettingsState, 'setAppearance' | 'setPageFormat' | 'setOrientation' | 'setInstitution' | 'applyInstitution'> {
  const defaults = {
    appearance: 'light' as Appearance,
    pageFormat: 'A4',
    orientation: 'Portrait',
    collegeName: '',
    department: '',
    logo: null as string | null,
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults
    return { ...defaults, ...(JSON.parse(raw) as Partial<typeof defaults>) }
  } catch {
    return defaults
  }
}

function persist(state: SettingsState) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        appearance: state.appearance,
        pageFormat: state.pageFormat,
        orientation: state.orientation,
        collegeName: state.collegeName,
        department: state.department,
        logo: state.logo,
      })
    )
  } catch {
    /* ignore */
  }
}

export const useSettings = create<SettingsState>()((set, get) => ({
  ...load(),
  setAppearance: (appearance) => {
    set({ appearance })
    persist(get())
    document.documentElement.classList.toggle('theme-dark', appearance === 'dark')
  },
  setPageFormat: (pageFormat) => {
    set({ pageFormat })
    persist(get())
  },
  setOrientation: (orientation) => {
    set({ orientation })
    persist(get())
  },
  setInstitution: (v) => {
    set((s) => ({ ...s, ...v }))
    persist(get())
  },
  applyInstitution: (report) => {
    const { collegeName, department } = get()
    if (collegeName) report.eventInfo.collegeName = collegeName
    if (department) report.eventInfo.department = department
  },
}))
